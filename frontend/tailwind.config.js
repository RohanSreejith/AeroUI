/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        automotive: {
          900: '#0a0a0f', // Deepest black-blue
          800: '#13131f', // Surface
          700: '#2a2a35', // Borders
          500: '#3b82f6', // Primary Blue
          400: '#60a5fa', // Light Blue accent
          accent: '#00f0ff', // Neon Cyan
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
