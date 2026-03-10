/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'float-up': {
          '0%': {
            opacity: '1',
            transform: 'translate(-50%, -18px) scale(0.96)',
          },
          '70%': {
            opacity: '0.35',
            transform: 'translate(-50%, -44px) scale(1.04)',
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%, -56px) scale(1.08)',
          },
        },
      },
      animation: {
        'float-up': 'float-up 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
