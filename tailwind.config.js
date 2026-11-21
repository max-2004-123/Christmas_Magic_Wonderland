/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#C41E3A',
          crimson: '#E63950',
          pine: '#0F3D2E',
          spruce: '#1B5E3C',
          gold: '#F5D07B',
          champagne: '#F9E4B0',
          snow: '#F8FAFF',
          night: '#061024',
          midnight: '#0B1D3D',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', '"Playfair Display"', '"Noto Serif TC"', 'Georgia', 'serif'],
        serif: ['"Noto Serif TC"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Noto Sans TC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.8s linear infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.75', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
