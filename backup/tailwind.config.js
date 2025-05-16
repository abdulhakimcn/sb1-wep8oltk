/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f3fa',
          100: '#cce7f6',
          200: '#99cfed',
          300: '#66b7e4',
          400: '#339fdb',
          500: '#0073b6', // Main primary color
          600: '#005c92',
          700: '#00456d',
          800: '#002e49',
          900: '#001724'
        },
        secondary: {
          50: '#e8f5ec',
          100: '#d0ebd9',
          200: '#a1d7b3',
          300: '#72c38d',
          400: '#43af67',
          500: '#34a853', // Main secondary color
          600: '#2a8642',
          700: '#1f6532',
          800: '#154321',
          900: '#0a2211'
        },
        accent: {
          50: '#fff0e5',
          100: '#ffe1cc',
          200: '#ffc399',
          300: '#ffa566',
          400: '#ff8733',
          500: '#ff6900', // Main accent color
          600: '#cc5400',
          700: '#993f00',
          800: '#662a00',
          900: '#331500'
        },
        success: {
          500: '#10b981'
        },
        warning: {
          500: '#f59e0b'
        },
        error: {
          500: '#ef4444'
        }
      },
      fontFamily: {
        sans: [
          '"Inter"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};