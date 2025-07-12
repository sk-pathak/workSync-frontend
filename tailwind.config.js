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
        primary: '#a259ff',
        'primary-dark': '#6c2bd7',
        'primary-light': '#a78bfa',
        card: '#232136',
        'card-foreground': '#f8f8ff',
        background: '#181825',
        'background-dark': '#13131a',
        'background-light': '#232336',
        accent: '#7c3aed',
        'accent-blue': '#38bdf8',
        'accent-light': '#67e8f9',
        muted: '#312e81',
        'muted-foreground': '#a1a1aa',
        border: '#28283a',
        input: '#232336',
        ring: '#a78bfa',
        'gradient-purple': 'linear-gradient(135deg, #7c3aed 0%, #38bdf8 100%)',
        'gradient-dark': 'linear-gradient(135deg, #232136 0%, #2d2d44 100%)',
      },
      boxShadow: {
        neu: '8px 8px 24px #1a1a2e, -8px -8px 24px #2d2d44',
        card: '0 4px 24px 0 rgba(124, 58, 237, 0.12)',
        button: '0 2px 8px 0 rgba(124, 58, 237, 0.15)',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #7c3aed 0%, #38bdf8 100%)',
        'gradient-dark': 'linear-gradient(135deg, #232336 0%, #7c3aed 100%)',
        'gradient-dark': 'linear-gradient(135deg, #232136 0%, #2d2d44 100%)',
      },
      transitionProperty: {
        'spacing': 'margin, padding',
        'neu': 'box-shadow, background, color, border',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'pop': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in',
        'pop': 'pop 0.2s cubic-bezier(0.4,0,0.2,1)',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function({ addUtilities }) {
      addUtilities({
        '.neu-card': {
          'background': 'linear-gradient(135deg, #232136 0%, #2d2d44 100%)',
          'box-shadow': '8px 8px 24px #1a1a2e, -8px -8px 24px #2d2d44',
          'border-radius': '1.25rem',
          'color': '#f8f8ff',
        },
        '.neu-btn': {
          'background': 'linear-gradient(135deg, #4c1d95 0%, #581c87 100%)',
          'box-shadow': '4px 4px 16px #1a1a2e, -4px -4px 16px #2d2d44',
          'border-radius': '1.25rem',
          'color': '#f8f8ff',
          'transition': 'box-shadow 0.2s, background 0.2s, color 0.2s',
        },
        '.neu-input': {
          'background': 'linear-gradient(135deg, #232136 0%, #2d2d44 100%)',
          'box-shadow': 'inset 2px 2px 8px #1a1a2e, inset -2px -2px 8px #2d2d44',
          'border-radius': '1.25rem',
          'color': '#f8f8ff',
          'border': '1px solid #3a3a5a',
          'padding': '0.5rem 1rem',
          'transition': 'box-shadow 0.2s, background 0.2s, color 0.2s',
        },
        '.hover-neu:hover': {
          'box-shadow': '0 0 0 4px #4c1d9555, 8px 8px 24px #1a1a2e, -8px -8px 24px #2d2d44',
          'background': 'linear-gradient(135deg, #2d2d44 0%, #232136 100%)',
        },
        '.neu-btn-dark': {
          'background': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          'box-shadow': '4px 4px 16px #1a1a2e, -4px -4px 16px #2d2d44',
          'border-radius': '1.25rem',
          'color': '#f8f8ff',
          'transition': 'box-shadow 0.2s, background 0.2s, color 0.2s',
        },
        '.bg-gradient-dark': {
          'background': 'linear-gradient(135deg, #232136 0%, #2d2d44 100%)',
        },
        '.line-clamp-1': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
      })
    }
  ],
};
