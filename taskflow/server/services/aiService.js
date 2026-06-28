// ─── Prompt template ─────────────────────────────────────────────────────────

const buildPrompt = (title, description) => {
  const today = new Date().toISOString().split('T')[0]

  return `You are a project management assistant. Based on the task below, estimate the effort and suggest a due date.

Task Title: ${title}
Task Description: ${description || 'No description provided.'}
Today's Date: ${today}

Respond ONLY with a single valid JSON object. Do NOT use markdown, code fences, or any other text.
The JSON must have exactly these three keys:

{
  "estimatedEffort": "a short human-readable effort string, e.g. '3-4 hours' or '2 days'",
  "suggestedDueDate": "ISO date string YYYY-MM-DD or null if not determinable",
  "reasoning": "one or two sentences explaining the estimate"
}

Your entire response must be parseable by JSON.parse() with no preprocessing.`
}

// ─── Model candidates (OpenRouter models) ────────────────────────────────────
// Reordered so the highly available standard models are tried first
const CANDIDATE_MODELS = [
  'google/gemini-2.5-flash',
  'google/gemini-1.5-flash',
  'google/gemini-2.5-flash:free',
  'google/gemini-1.5-flash:free',
  'meta-llama/llama-3-8b-instruct:free',
]

// ─── AI Service ───────────────────────────────────────────────────────────────

/**
 * Calls OpenRouter to generate a task estimation suggestion.
 * Supports both OPENROUTER_API_KEY and GEMINI_API_KEY environment variables.
 *
 * @param {string} title       - Task title (required)
 * @param {string} description - Task description (optional)
 * @returns {Promise<object|null>}
 */
const generateTaskSuggestion = async (title, description = '') => {
  try {
    let apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openrouter_api_key_here') {
      apiKey = process.env.GEMINI_API_KEY
    }

    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
      console.warn('[aiService] OpenRouter API key not configured — using fallback')
      return null
    }

    const cleanKey = apiKey.trim()
    const prompt = buildPrompt(title, description)
    let lastError = null

    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`[aiService] Trying OpenRouter model: ${modelName}…`)

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cleanKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'TaskFlow',
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 512,
            response_format: { type: 'json_object' },
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(
            `HTTP ${response.status}: ${
              errData.error?.message || response.statusText
            }`,
          )
        }

        const data = await response.json()
        const text = data.choices?.[0]?.message?.content

        if (!text || !text.trim()) {
          console.warn(`[aiService] Empty text returned from ${modelName}`)
          continue
        }

        // Clean potential markdown fences (just in case model ignored response_format)
        const cleaned = text
          .trim()
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/, '')
          .trim()

        const parsed = JSON.parse(cleaned)

        if (
          typeof parsed.estimatedEffort !== 'string' ||
          typeof parsed.reasoning !== 'string'
        ) {
          console.warn(`[aiService] Shape invalid from ${modelName}:`, parsed)
          continue
        }

        console.log(`[aiService] ✓ Success with OpenRouter model: ${modelName}`)

        return {
          estimatedEffort: parsed.estimatedEffort.trim(),
          suggestedDueDate: parsed.suggestedDueDate || null,
          reasoning: parsed.reasoning.trim(),
        }
      } catch (modelError) {
        lastError = modelError
        console.warn(`[aiService] OpenRouter model ${modelName} failed:`, modelError.message)
      }
    }

    console.error('[aiService] All OpenRouter models failed. Last error:', lastError?.message)
    return null
  } catch (error) {
    console.error('[aiService] Unexpected error in OpenRouter call:', error?.message || error)
    return null
  }
}

module.exports = { generateTaskSuggestion }
