/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        duo: {
          green: '#10B981',
          greenDark: '#059669',
          yellow: '#F59E0B',
          yellowDark: '#D97706',
          blue: '#6366F1',
          blueDark: '#4F46E5',
          red: '#EF4444',
          redDark: '#DC2626',
          gray: '#334155'
        }
      },
      boxShadow: {
        'duo-green': '0 4px 0 #059669',
        'duo-blue': '0 4px 0 #4F46E5',
        'duo-yellow': '0 4px 0 #D97706',
        'duo-red': '0 4px 0 #DC2626',
        'duo-gray': '0 4px 0 #1E293B',
      }
    },
  },
  plugins: [],
}
