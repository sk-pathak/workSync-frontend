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
        DEFAULT: '0.75rem',
        lg: '1rem',
        md: '0.625rem',
        sm: '0.5rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      colors: {
        background: {
          DEFAULT: '#0a0a0f',
          secondary: '#111118',
          tertiary: '#1a1a24',
        },
        surface: {
          DEFAULT: 'rgba(20, 20, 32, 0.6)',
          hover: 'rgba(26, 26, 40, 0.7)',
          active: 'rgba(32, 32, 48, 0.8)',
        },
        text: {
          primary: '#e8e8f0',
          secondary: '#a0a0b8',
          tertiary: '#70708c',
          muted: '#505064',
        },
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        deepPurple: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
          hover: '#9d6eff',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        primary: '#8b5cf6',
        'primary-dark': '#7c3aed',
        'primary-light': '#a78bfa',
        card: 'rgba(20, 20, 32, 0.6)',
        'card-foreground': '#e8e8f0',
        'background-dark': '#0a0a0f',
        'background-light': '#1a1a24',
        'accent-blue': '#60a5fa',
        muted: '#505064',
        'muted-foreground': '#a0a0b8',
        border: 'rgba(139, 92, 246, 0.2)',
        input: 'rgba(20, 20, 32, 0.6)',
        ring: '#a78bfa',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(139, 92, 246, 0.15)',
        'glow-md': '0 0 30px rgba(139, 92, 246, 0.2)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.25)',
        'glow-purple': '0 0 60px rgba(139, 92, 246, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(139, 92, 246, 0.1)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 12px 48px rgba(139, 92, 246, 0.2)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)',
        'gradient-surface': 'linear-gradient(135deg, rgba(20, 20, 32, 0.6) 0%, rgba(26, 26, 40, 0.6) 100%)',
      },
      backdropBlur: {
        glass: '12px',
      },
      transitionProperty: {
        'spacing': 'margin, padding',
        'transform': 'transform',
        'glow': 'box-shadow, border-color',
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-in-fast': 'fade-in-fast 0.2s ease-out',
        'slide-in-left': 'slide-in-left 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
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
