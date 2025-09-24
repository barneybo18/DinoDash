/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['"Press Start 2P"', 'cursive'],
      },
      keyframes: {
        'gradient-pan': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: 1, 'text-shadow': '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #0fa, 0 0 30px #0fa, 0 0 40px #0fa, 0 0 55px #0fa, 0 0 75px #0fa' },
          '50%': { opacity: 0.8, 'text-shadow': '0 0 5px #fff, 0 0 8px #fff, 0 0 15px #0fa, 0 0 25px #0fa, 0 0 30px #0fa, 0 0 45px #0fa, 0 0 65px #0fa' },
        }
      },
      animation: {
        'gradient-pan': 'gradient-pan 15s ease infinite',
        'neon-flicker': 'neon-flicker 1.5s infinite alternate',
      },
    },
  },
  plugins: [],
}