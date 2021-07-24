const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: colors.trueGray,
        primary: colors.sky,
        secondary: colors.teal
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
