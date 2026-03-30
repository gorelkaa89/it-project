/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 35px -18px rgba(2, 6, 23, 0.45)'
      }
    }
  },
  plugins: []
};
