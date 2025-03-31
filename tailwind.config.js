/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7A00',
          light: '#FF9A33',
          dark: '#CC6200',
        },
        secondary: {
          DEFAULT: '#FF9F45',
          light: '#FFBC77',
          dark: '#E67E20',
        },
      },
      fontFamily: {
        sans: ['"Dataidea Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 