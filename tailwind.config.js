function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: withOpacity('--brand-bg'),
          surface: withOpacity('--brand-surface'),
          elevated: withOpacity('--brand-elevated'),
          border: withOpacity('--brand-border'),
          primary: withOpacity('--brand-primary'),
          secondary: withOpacity('--brand-secondary'),
          cyan: withOpacity('--brand-cyan'),
          text: withOpacity('--brand-text'),
          muted: withOpacity('--brand-muted'),
          subtle: withOpacity('--brand-subtle'),
        }
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        }
      },
      animation: {
        ripple: 'ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'sans-serif'],
      },
      transitionDuration: {
        'micro': '200ms',     // Micro interactions: 180–250ms
        'card': '400ms',      // Card hover: 300–450ms
        'page': '600ms',      // Page transitions: 500–800ms
        'hero': '1000ms',     // Hero reveal: 800–1200ms
        'ambient': '12000ms', // Background ambience: 8–15s
      },
      animation: {
        'ambient-glow': 'ambientGlow 12s ease-in-out infinite alternate',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
      },
      keyframes: {
        ambientGlow: {
          '0%': { transform: 'scale(1) translate(0, 0)', opacity: '0.4' },
          '100%': { transform: 'scale(1.1) translate(2%, 2%)', opacity: '0.7' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
