/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        secondary: '#EC4899',
        theme: {
          primary: 'var(--theme-primary)',
          hover: 'var(--theme-hover)',
          text: 'var(--theme-text)',
          border: 'var(--theme-border)',
        }
      }
    },
  },
  plugins: [],
}
