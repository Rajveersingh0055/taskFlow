import { useEffect, useRef, useState } from 'react'

/**
 * SearchBar — debounced search input that calls onChange(query) after 300ms.
 * Props:
 *  - value: current search string
 *  - onChange(query): called with debounced value
 *  - placeholder: input placeholder text
 */
function SearchBar({ value, onChange, placeholder = 'Search boards…' }) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef(null)

  // Sync external resets (e.g. clearing from parent)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e) => {
    const q = e.target.value
    setLocalValue(q)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(q), 300)
  }

  const handleClear = () => {
    setLocalValue('')
    clearTimeout(timerRef.current)
    onChange('')
  }

  return (
    <div className="relative flex-1">
      {/* Search icon */}
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      >
        🔍
      </span>

      <input
        id="board-search"
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        aria-label="Search boards"
      />

      {/* Clear button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar
