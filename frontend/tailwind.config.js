/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        accent: {
          DEFAULT: '#f97316',
          light:   '#fb923c',
          dark:    '#ea580c',
        },
        success: '#22c55e',
        warning: '#eab308',
        danger:  '#ef4444',
        surface: {
          DEFAULT: '#0f0f0f',
          50:  '#1a1a1a',
          100: '#242424',
          200: '#2e2e2e',
          300: '#3a3a3a',
        },
      },
      fontFamily: {
        sans:  ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter var', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-in':   'slideIn 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'spin-slow':  'spin 4s linear infinite',
        'gradient':   'gradientShift 5s ease infinite',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(14, 165, 233, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient':     'radial-gradient(at 40% 20%, hsla(199,100%,56%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(212,100%,56%,1) 0px, transparent 50%)',
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow':        '0 0 20px rgba(14, 165, 233, 0.4)',
        'glow-lg':     '0 0 40px rgba(14, 165, 233, 0.6)',
        'inner-glow':  'inset 0 0 20px rgba(14, 165, 233, 0.2)',
        'glass':       '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card':        '0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
