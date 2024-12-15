/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./index.html",
     "./src/**/*.{js,jsx,ts,tsx}",
],
  theme: {
    extend: {},
    screens: {
      'sm': '390px',
      'md': '640px',
    }
  },
  plugins: [
      require('@tailwindcss/forms')
  ],
}

