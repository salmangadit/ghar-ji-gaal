import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#4ECDC4',
        success: '#51CF66',
        error: '#FF6B6B',
        warning: '#FFB347',
        bg: '#FAFAFA',
      },
    },
  },
  plugins: [],
} satisfies Config;
