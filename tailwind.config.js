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
          50: 'var(--wine-50, #fcf5f5)',
          100: 'var(--wine-100, #f8e9e9)',
          200: 'var(--wine-200, #f0d2d2)',
          300: 'var(--wine-300, #e6b0b0)',
          400: 'var(--wine-400, #d77e7e)',
          500: 'var(--wine-500, #c95252)',
          600: 'var(--wine-600, #b93333)',
          700: 'var(--wine-700, #9c2727)',
          800: 'var(--wine-800, #7f1d1d)', // Default wine color
          900: 'var(--wine-900, #671919)',
          950: 'var(--wine-950, #450505)',
        },
        burgundy: {
          50: 'var(--burgundy-50, #fcf5f5)',
          100: 'var(--burgundy-100, #f8e9e9)',
          200: 'var(--burgundy-200, #f0d2d2)',
          300: 'var(--burgundy-300, #e6b0b0)',
          400: 'var(--burgundy-400, #d77e7e)',
          500: 'var(--burgundy-500, #c95252)',
          600: 'var(--burgundy-600, #b93333)',
          700: 'var(--burgundy-700, #9c2727)',
          800: 'var(--burgundy-800, #7f1d1d)',
          900: 'var(--burgundy-900, #671919)',
          950: 'var(--burgundy-950, #450505)',
        },
        sage: {
          50: 'var(--sage-50, #f5f7f6)',
          100: 'var(--sage-100, #e5e9e7)',
          200: 'var(--sage-200, #d0d8d4)',
          300: 'var(--sage-300, #b0bfb7)',
          400: 'var(--sage-400, #91a599)',
          500: 'var(--sage-500, #738b7d)',
          600: 'var(--sage-600, #607a6c)',
          700: 'var(--sage-700, #4c5e53)',
          800: 'var(--sage-800, #3f4c46)',
          900: 'var(--sage-900, #374239)',
        }
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
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