/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ESIEE Brand Colors
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#2F2A85', // Main ESIEE Purple
          700: '#262275',
          800: '#1e1a5e',
          900: '#16124a',
        },
        esiee: {
          purple: '#2F2A85',
          dark: '#1e1a5e',
          light: '#8b5cf6',
        },
      },
    },
  },
  plugins: [],
}
