import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title:["Montserrat Medium 500", "sans-serif"],
      },
      backgroundImage: {
        'background-pattern': "url('../public/login-02.jpg')",
        'background-home': "url('../public/image-12.png')",
      },
      colors: {
        'color-primary': "#4F959D",
        'color-primary-light': " #F6F4EB",
        'color-secondary': "#205781",
      },
    },
  },
  plugins: [
    daisyui,
    require('tailwind-scrollbar'),
  ],
}