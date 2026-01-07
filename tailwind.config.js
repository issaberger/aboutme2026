/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.{html,js,ts,jsx,tsx}",
    "!./node_modules/**"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        cyber: ['"Rajdhani"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        bg: 'var(--color-bg)',
        panel: 'var(--color-panel)',
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}