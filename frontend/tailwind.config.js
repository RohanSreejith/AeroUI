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
          900: '#050B14', // Dark Navy/Black background
          800: '#0F172A', // Panel background (Deep Graphite)
          700: '#1E293B', // Border/Divider
          600: '#334155', // Secondary border
          500: '#3b82f6', // Primary Blue
          accent: '#00F0FF', // Neon Cyan
          highlight: '#38BDF8', // Electric Blue
          glass: 'rgba(15, 23, 42, 0.6)', // Glass panel base
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'], // For techy numbers
      },
      dropShadow: {
        'glow': '0 0 10px rgba(0, 240, 255, 0.5)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.6)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      }
    },
  },
  plugins: [],
}
