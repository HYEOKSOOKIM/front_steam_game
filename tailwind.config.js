/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'steam-dark': '#171A21',
        'steam-gradient-start': '#1b2838',
        'steam-gradient-end': '#2a475e',
        'highlight': '#66C0F4',
        'primary': '#C7D5E0',
        'secondary': '#8F98A0',
      },
      fontFamily: {
        'motiva': ['"Motiva Sans"', 'sans-serif'],
        'outfit': ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'steam-gradient': 'linear-gradient(to bottom right, #1b2838, #2a475e)',
      }
    },
  },
  plugins: [],
}
