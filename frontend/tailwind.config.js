/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blood-red': '#C8102E',
        'blood-light': '#E5485D',
        'eye-comfort-bg': '#F5F6F8',
        'eye-comfort-text': '#111827',
        primary: 'var(--color-primary)',
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-text)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        red: {
          50: '#fff1f2',
          100: '#ffe4e8',
          500: '#d52a45',
          600: '#c8102e',
          700: '#a50e27',
        },
      },
    },
  },
  plugins: [],
}
