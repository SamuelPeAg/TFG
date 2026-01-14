/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
  ],
  darkMode: 'class', // <--- ESTO ES LO IMPORTANTE
  theme: {
    extend: {
      colors: {
        brandTeal: '#4BB7AE',
        brandCoral: '#EF5D7A',
        brandAqua: '#A5EFE2',
        darkText: '#2D3748',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}