/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#14B8A6',
        nuraBg: '#FAFAFA',
        nuraSurface: '#FFFFFF',
        nuraText: '#111827',
        nuraTextSecondary: '#6B7280',
        nuraSuccess: '#22C55E',
        nuraWarning: '#F59E0B',
        nuraError: '#EF4444',
        nuraBorder: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
