/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          'blue-dark': '#1557b0',
          'blue-light': '#e8f0fe',
          red: '#ea4335',
          yellow: '#fbbc04',
          green: '#34a853',
          gray: {
            50: '#f8f9fa',
            100: '#f1f3f4',
            200: '#e8eaed',
            300: '#dadce0',
            400: '#bdc1c6',
            500: '#9aa0a6',
            600: '#80868b',
            700: '#5f6368',
            800: '#3c4043',
            900: '#202124',
          }
        },
        calendar: {
          'event-blue': '#1a73e8',
          'event-red': '#d50000',
          'event-yellow': '#f9ab00',
          'event-green': '#0d7377',
          'event-purple': '#9c27b0',
          'event-orange': '#ff6d01',
          'event-teal': '#039be5',
          'event-pink': '#ad1457',
        }
      },
      fontFamily: {
        'google': ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'google': '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
        'google-lg': '0 2px 6px 2px rgba(60,64,67,.15), 0 1px 2px 0 rgba(60,64,67,.3)',
      }
    },
  },
  plugins: [],
}