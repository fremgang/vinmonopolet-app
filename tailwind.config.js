/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      colors: {
        cream: '#F9F1E7',
        accent: '#7f1d1d', // Wine red
        wine: {
          50: '#fcf5f5',
          100: '#f8e9e9',
          200: '#f0d2d2',
          300: '#e6b0b0',
          400: '#d77e7e',
          500: '#c95252',
          600: '#b93333',
          700: '#9c2727',
          800: '#7f1d1d', // Default wine color
          900: '#671919',
          950: '#450505',
        },
        burgundy: {
          50: '#fcf5f5',
          100: '#f8e9e9',
          200: '#f0d2d2',
          300: '#e6b0b0',
          400: '#d77e7e',
          500: '#c95252',
          600: '#b93333',
          700: '#9c2727',
          800: '#7f1d1d',
          900: '#671919',
          950: '#450505',
        },
        sage: {
          50: '#f5f7f6',
          100: '#e5e9e7',
          200: '#d0d8d4',
          300: '#b0bfb7',
          400: '#91a599',
          500: '#738b7d',
          600: '#607a6c',
          700: '#4c5e53',
          800: '#3f4c46',
          900: '#374239',
        }
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      scrollMargin: {
        '32': '8rem',
      },
    },
  },
  plugins: [],
};