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
          emerald: withOpacity('--brand-emerald'),
          amber: withOpacity('--brand-amber'),
          text: withOpacity('--brand-text'),
          muted: withOpacity('--brand-muted'),
          subtle: withOpacity('--brand-subtle'),
        }
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        ambientGlow: {
          '0%': { transform: 'scale(1) translate(0, 0)', opacity: '0.4' },
          '100%': { transform: 'scale(1.1) translate(2%, 2%)', opacity: '0.7' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        borderBeam: {
          '100%': { 'offset-distance': '100%' }
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        aurora: {
          '0%, 100%': { backgroundPosition: '50% 50%, 50% 50%' },
          '50%': { backgroundPosition: '350% 50%, 350% 50%' }
        }
      },
      animation: {
        ripple: 'ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'ambient-glow': 'ambientGlow 12s ease-in-out infinite alternate',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-subtle': 'floatSubtle 4s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 2.5s infinite linear',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'border-beam': 'borderBeam 6s linear infinite',
        'spin-slow': 'spinSlow 20s linear infinite',
        aurora: 'aurora 60s linear infinite',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
      },
      transitionDuration: {
        'micro': '180ms',
        'card': '300ms',
        'page': '500ms',
        'hero': '800ms',
        'ambient': '12000ms',
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
