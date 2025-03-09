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
        'cream': '#f9f7f2',
        'cabernet': {
          '50': 'var(--cabernet-50, #fbf5f6)',
          '100': 'var(--cabernet-100, #f7ebed)',
          '200': 'var(--cabernet-200, #f0d6dc)',
          '300': 'var(--cabernet-300, #e3b3bf)',
          '400': 'var(--cabernet-400, #d4859a)',
          '500': 'var(--cabernet-500, #c05d7a)',
          '600': 'var(--cabernet-600, #a94264)',
          '700': 'var(--cabernet-700, #8d3450)',
          '800': 'var(--cabernet-800, #762e45)',
          '900': 'var(--cabernet-900, #632a3c)',
          '950': 'var(--cabernet-950, #3b151f)',
        },
        'oak': {
          '50': 'var(--oak-50, #f9f7f4)',
          '100': 'var(--oak-100, #f3ede6)',
          '200': 'var(--oak-200, #e5d8c8)',
          '300': 'var(--oak-300, #d6bea4)',
          '400': 'var(--oak-400, #c39c7a)',
          '500': 'var(--oak-500, #b4835d)',
          '600': 'var(--oak-600, #a7714e)',
          '700': 'var(--oak-700, #8b5a3f)',
          '800': 'var(--oak-800, #734938)',
          '900': 'var(--oak-900, #5f3d32)',
          '950': 'var(--oak-950, #331f19)',
        },
        'vineyard': {
          '50': 'var(--vineyard-50, #f6f7f6)',
          '100': 'var(--vineyard-100, #e2e7e1)',
          '200': 'var(--vineyard-200, #c4d0c2)',
          '300': 'var(--vineyard-300, #a0b49d)',
          '400': 'var(--vineyard-400, #7c9478)',
          '500': 'var(--vineyard-500, #5f795c)',
          '600': 'var(--vineyard-600, #4a6148)',
          '700': 'var(--vineyard-700, #3d4e3b)',
          '800': 'var(--vineyard-800, #324032)',
          '900': 'var(--vineyard-900, #2b362b)',
          '950': 'var(--vineyard-950, #151d15)',
        }
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'subtle': '0 1px 2px 0 rgba(0,0,0,0.05)',
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
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};