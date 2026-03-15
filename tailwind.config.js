/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
  ],
  darkMode: 'class',
  safelist: [
    // Brand colors
    'bg-brandTeal',
    'bg-brandCoral',
    'bg-brandAqua',
    'text-brandTeal',
    'text-brandCoral',
    'text-brandAqua',
    'border-brandTeal',
    'border-brandCoral',
    'border-brandAqua',
    // Gradient colors
    'from-brandTeal',
    'to-brandCoral',
    'via-brandAqua',
    // Text colors for badges
    'text-white',
    'text-gray-900',
    // Hover states
    'hover:text-brandTeal',
    'hover:border-brandTeal',
    'group-hover:text-brandTeal',
    'hover:bg-brandTeal/10',
    // Additional utilities
    'bg-brandTeal/20',
    'bg-brandCoral/20',
    'bg-brandAqua/20',
    'bg-brandTeal/10',
    'bg-brandCoral/10',
    // Sticky positioning
    'self-start',
    'sticky',
    'top-24',
    // Shadows
    'shadow-brandTeal/30',
    'shadow-brandCoral/30',
  ],
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
}