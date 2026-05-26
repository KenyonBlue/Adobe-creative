/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#09090b',
          surface: '#111113',
          elevated: '#18181b',
          border: 'rgba(255,255,255,0.08)',
          muted: '#71717a',
          text: '#fafafa',
          accent: '#3b82f6',
          firefly: '#1473E6',
          glow: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.4s ease-out forwards',
        fadeInUp: 'fadeInUp 0.4s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'mesh-gradient':
          'radial-gradient(at 40% 20%, rgba(59,130,246,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(20,115,230,0.08) 0px, transparent 50%)',
        'accent-gradient': 'linear-gradient(135deg, #1473E6 0%, #8b5cf6 100%)',
      },
    },
  },
  plugins: [],
};
