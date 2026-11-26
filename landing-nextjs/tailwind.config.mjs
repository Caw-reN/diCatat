/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FFFDF7',
          card: '#FFFFFF',
          warm: '#FAF6EE',
        },
        ink: {
          DEFAULT: '#2C2A29',
          muted: '#6E6A66',
        },
        highlight: {
          DEFAULT: '#FFE066',
          soft: '#FFF3B0',
        },
        mint: {
          DEFAULT: '#A8E6CF',
          soft: '#E2F8F0',
        },
        coral: {
          DEFAULT: '#FF8B94',
          soft: '#FFE5E7',
        },
        sky: {
          DEFAULT: '#A0C4FF',
          soft: '#E8F1FF',
        },
        oren: {
          DEFAULT: '#FF9F43',
          dark: '#E5801D',
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
      }
    },
  },
  plugins: [],
};

