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
        'esiee-blue': '#0066CC',  // Main ESIEE Blue
        'esiee-red': '#E31E24',   // ESIEE Red
        'esiee-purple': '#2F2A85', // ESIEE Purple (alternative)
        primary: {
          50: '#e6f2ff',
          100: '#cce5ff',
          200: '#99ccff',
          300: '#66b3ff',
          400: '#3399ff',
          500: '#0080ff',
          600: '#0066CC', // Main ESIEE Blue
          700: '#0052a3',
          800: '#003d7a',
          900: '#002952',
        },
        esiee: {
          blue: '#0066CC',
          red: '#E31E24',
          purple: '#2F2A85',
          dark: '#1e1a5e',
          light: '#8b5cf6',
        },
      },
    },
  },
  plugins: [],
}
