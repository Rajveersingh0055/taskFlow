/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        priority: {
          low: '#10b981',       // emerald-500
          'low-bg': '#d1fae5',  // emerald-100
          medium: '#f59e0b',    // amber-500
          'medium-bg': '#fef3c7', // amber-100
          high: '#ef4444',      // red-500
          'high-bg': '#fee2e2', // red-100
        },
        status: {
          todo: '#64748b',         // slate-500
          'todo-bg': '#f1f5f9',    // slate-100
          'in-progress': '#3b82f6', // blue-500
          'in-progress-bg': '#dbeafe', // blue-100
          done: '#10b981',         // emerald-500
          'done-bg': '#d1fae5',    // emerald-100
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
