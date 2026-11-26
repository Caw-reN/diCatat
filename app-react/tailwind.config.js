/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FFFDF7',
          card: '#FFFFFF',
          warm: '#FAF6EE',
          line: '#E6DEC8',
        },
        ink: {
          DEFAULT: '#2C2A29',
          muted: '#6E6A66',
          light: '#9E9891',
        },
        highlight: {
          DEFAULT: '#FFE066',
          soft: '#FFF3B0',
        },
        mint: {
          DEFAULT: '#A8E6CF',
          dark: '#56C596',
          soft: '#E2F8F0',
        },
        coral: {
          DEFAULT: '#FF8B94',
          dark: '#F25F6B',
          soft: '#FFE5E7',
        },
        sky: {
          DEFAULT: '#A0C4FF',
          dark: '#5B9BD5',
          soft: '#E8F1FF',
        },
        lavender: {
          DEFAULT: '#BDB2FF',
          soft: '#F0EDFF',
        },
        oren: {
          DEFAULT: '#FF9F43',
          dark: '#E5801D',
          light: '#FFD8A8',
        }
      },
      fontFamily: {
        display: ['"Fredoka"', 'sans-serif'],
        hand: ['"Patrick Hand"', 'cursive'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        doodle: '3px 4px 0px #2C2A29',
        'doodle-sm': '2px 2px 0px #2C2A29',
        'doodle-lg': '5px 6px 0px #2C2A29',
        'doodle-active': '1px 1px 0px #2C2A29',
      }
    },
  },
  plugins: [],
};

