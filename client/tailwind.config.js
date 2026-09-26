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
        background: '#050505',
        surface: {
          DEFAULT: '#0B0B0B',
          card: '#111111',
          hover: '#161616',
          border: '#1F1F1F',
          muted: '#2A2A2A',
        },
        accent: {
          DEFAULT: '#00F0FF',
          glow: 'rgba(0, 240, 255, 0.35)',
          dark: '#00A3AD',
          blue: '#0070F3',
        },
        technical: {
          cyan: '#00F0FF',
          green: '#00FF66',
          amber: '#FFB800',
          red: '#FF3366',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        widest: '0.25em',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
