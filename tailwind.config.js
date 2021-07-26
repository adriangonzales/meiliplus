const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: colors.trueGray,
        primary: colors.sky,
        secondary: colors.teal,
        bright: {
          100: '#F5F5F5',
          200: '#F0F0F0',
          300: '#E6E6E6',
          400: '#DEDEDE',
          500: '#C6C6C6',
          600: '#9A9A9A',
          700: '#757575',
          800: '#595959',
          900: '#252525'
        },
        dim: {
          100: '#DEDEDE',
          200: '#9D9D9D',
          300: '#5B5B5B',
          400: '#565656',
          500: '#3F3F3F',
          600: '#333333',
          700: '#2E2E2E',
          800: '#292929',
          900: '#1E1E1E'
        },
      },
      gridTemplateColumns: {
        'offset': 'minmax(100px, 1fr) 3fr',
      }
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active'],
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
