/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Masar+ brand palette — grounded in the logo's gold + wine, not a generic SaaS default.
        primary: {
          50: '#fbf1f4',
          100: '#f5dce4',
          200: '#e9b3c4',
          300: '#d987a2',
          400: '#c25c7c',
          500: '#a13a5c',
          600: '#7a1f3d', // wine — core brand color
          700: '#63182f',
          800: '#4c1224',
          900: '#3b1220', // plum — dark section background
        },
        gold: {
          50: '#fdf9f0',
          100: '#f7ecd4',
          200: '#eed7a3',
          300: '#e0bd76',
          400: '#d2a852',
          500: '#c99a42', // core gold accent — lightened from the original #b8862e
          600: '#a87f34',
          700: '#83632a',
        },
        neutral: {
          50: '#fbf6ee', // cream — base background
          100: '#f0e6d2', // sand — alternating section surface
          200: '#e4d5b8',
          300: '#c9b896',
          400: '#9c8a72',
          600: '#5a4a42',
          700: '#453833',
          900: '#2b1b1f', // ink — body/heading text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        arabic: ['"Cairo"', '"Noto Kufi Arabic"', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-rtl')],
};
