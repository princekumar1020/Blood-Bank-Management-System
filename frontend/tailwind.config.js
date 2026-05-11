/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blood-red': '#8B0000',
        'blood-light': '#D32F2F',
        'eye-comfort-bg': '#F5F5F7',
        'eye-comfort-text': '#1D1D1F',
      },
    },
  },
  plugins: [],
}

