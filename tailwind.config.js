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
          DEFAULT: '#008374',
          light: '#33998c',
          dark: '#005b51',
        },
        secondary: {
          DEFAULT: '#00b6a1',
          light: '#33c4b4',
          dark: '#007f70',
        },
      },
      fontFamily: {
        sans: ['"Dataidea Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 