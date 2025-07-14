/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  safelist: [
    'bg-background',
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '1rem',
        lg: '1.25rem',
        md: '0.75rem',
        sm: '0.5rem',
        neu: '1.25rem',
      },
      colors: {
        background: '#1a0f2a',
        surface: '#1e132f',
        'surface-hover': '#24183a',
        'text-primary': '#e1e1e1',
        'text-secondary': '#a8a8a8',
        accent: '#7f5af0',
        'accent-light': '#9f7cff',
        'accent-dark': '#5d3fd3',
        error: '#f65a5a',
        
        primary: '#7f5af0',
        'primary-dark': '#5d3fd3',
        'primary-light': '#9f7cff',
        card: '#1e132f',
        'card-foreground': '#e1e1e1',
        'background-dark': '#1a0f2a',
        'background-light': '#24183a',
        'accent-blue': '#38bdf8',
        muted: '#312e81',
        'muted-foreground': '#a8a8a8',
        border: '#24183a',
        input: '#1e132f',
        ring: '#9f7cff',
        'gradient-purple': 'linear-gradient(135deg, #7f5af0 0%, #9f7cff 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a0f2a 0%, #1e132f 100%)',
      },
      boxShadow: {
        glass: '0 2px 16px 0 rgba(127, 90, 240, 0.08)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7f5af0 0%, #9f7cff 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #5d3fd3 0%, #7f5af0 50%, #9f7cff 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a0f2a 0%, #1e132f 100%)',
        'gradient-surface': 'linear-gradient(135deg, #1e132f 0%, #24183a 100%)',
      },
      backdropBlur: {
        glass: 'blur(4px)',
      },
      transitionProperty: {
        'spacing': 'margin, padding',
        'neu': 'box-shadow, background, color, border',
        'glass': 'backdrop-filter, background, border',
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'pop': {
          '0%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        'count-up': {
          from: { opacity: 0, transform: 'translateY(5px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'pop': 'pop 0.1s cubic-bezier(0.4,0,0.2,1)',
        'slide-in': 'slide-in 0.15s ease-out',
        'slide-up': 'slide-up 0.15s ease-out',
        'count-up': 'count-up 0.2s ease-out',
        'accordion-down': 'accordion-down 0.15s ease-out',
        'accordion-up': 'accordion-up 0.15s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function({ addUtilities }) {
      addUtilities({
        '.glass-card': {
          'background': 'rgba(30, 19, 47, 0.85)',
          'border': '1px solid rgba(127, 90, 240, 0.15)',
          'backdrop-filter': 'blur(4px)',
          '-webkit-backdrop-filter': 'blur(4px)',
          'box-shadow': '0 2px 16px 0 rgba(127, 90, 240, 0.08)',
          'border-radius': '1.5rem',
          'will-change': 'transform',
          'transform': 'translateZ(0)',
        },
        '.glass-button': {
          'background': 'rgba(127, 90, 240, 0.1)',
          'border': '1px solid rgba(127, 90, 240, 0.15)',
          'backdrop-filter': 'blur(4px)',
          '-webkit-backdrop-filter': 'blur(4px)',
          'color': '#e1e1e1',
          'border-radius': '0.75rem',
          'transition': 'all 0.15s ease-out',
          'will-change': 'transform, background, border-color',
          'transform': 'translateZ(0)',
        },
        '.glass-button:hover': {
          'background': 'rgba(127, 90, 240, 0.18)',
          'border-color': '#9f7cff',
          'color': '#fff',
          'transform': 'scale(1.01)',
        },
        '.hardware-accelerated': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          'perspective': '1000px',
        },
        '.smooth-scroll': {
          'scroll-behavior': 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
        '.optimized-transition': {
          'transition': 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          'will-change': 'transform, opacity',
        },
      })
    }
  ],
};
