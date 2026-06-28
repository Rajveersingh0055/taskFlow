import api from './api'

/**
 * AI Service — calls the backend /api/ai endpoint.
 * JWT is auto-injected via the shared axios instance.
 * Never call Gemini directly from the frontend (key would be exposed).
 */

/**
 * Get an AI-powered task estimation suggestion.
 * @param {{ title: string, description?: string }} taskData
 * @returns {Promise<{ success: boolean, fallback: boolean, suggestion: object }>}
 */
const getSuggestion = async ({ title, description = '' }) => {
  const { data } = await api.post('/api/ai/suggest', { title, description })
  return data
}

export { getSuggestion }
