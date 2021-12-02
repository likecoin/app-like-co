const aspectRatio = require('@tailwindcss/aspect-ratio')
const plugin = require('tailwindcss/plugin')

module.exports = {
  mode: 'jit',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#FFF',
      red: '#E35050',
      'like-green': '#28646E',
      'like-cyan': '#50E3C2',
      'like-cyan-light': '#AAF1E7',
      'like-cyan-extralight': '#D7ECEC',
      'dark-gray': '#4A4A4A',
      'medium-gray': '#9B9B9B',
      'shade-gray': '#EBEBEB',
      'light-gray': '#F7F7F7',
      'airdrop-gold':'#D1AB79',
      'twitter-blue':'#4696F1',
    },
    boxShadow: {
      popup: '2px 4px 8px rgba(0, 0, 0, 0.25)',
    },
    fontFamily: {
      'mono': [
        'PT Mono',
        'monospace',
      ],
    },
    extend: {
      height: {
        '40px': '40px',
        '44px': '44px',
        '48px': '48px',
        '64px': '64px',
      },
    },
  },
  plugins: [
    aspectRatio,
    plugin(({ addUtilities }) => {
      const newUtilities = {
        '.scrollbar-hidden': {
          '-ms-overflow-style': 'none', /* IE and Edge */
          'scrollbar-width': 'none', /* Firefox */
          '&::-webkit-scrollbar': { 
            display: 'none', /* Chrome */
          },
        },
        '.text-stroke': {
          '-webkit-text-stroke': '1px #AAF1E7',
        },
      }
      addUtilities(newUtilities)
    }),
  ],
}
