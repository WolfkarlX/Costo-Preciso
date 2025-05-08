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
      }
    },
  },
  plugins: [daisyui],
}