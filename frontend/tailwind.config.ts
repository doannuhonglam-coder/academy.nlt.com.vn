import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        brand: ['Playfair Display', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        coral: {
          400: '#FF7B54',
          500: '#FF6B35',
          600: '#E55A24',
        },
        gold: {
          400: '#FFD166',
          500: '#FFC233',
          600: '#E5A800',
        },
        teal: {
          400: '#06D6A0',
          500: '#05C091',
          600: '#04A87E',
        },
        academy: {
          dark: '#1A1520',
          purple: '#2D2048',
          'dark-card': '#12101A',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FFD166 50%, #06D6A0 100%)',
        'continue-gradient': 'linear-gradient(135deg, #1A1520 0%, #2D2048 100%)',
        'daily-gradient': 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
