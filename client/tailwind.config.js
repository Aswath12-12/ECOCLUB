/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        house: {
          green: {
            light: '#ecfdf5',
            border: '#a7f3d0',
            DEFAULT: '#10b981',
            dark: '#047857',
            text: '#065f46'
          },
          blue: {
            light: '#eff6ff',
            border: '#bfdbfe',
            DEFAULT: '#3b82f6',
            dark: '#1d4ed8',
            text: '#1e40af'
          },
          red: {
            light: '#fef2f2',
            border: '#fecaca',
            DEFAULT: '#ef4444',
            dark: '#b91c1c',
            text: '#991b1b'
          },
          yellow: {
            light: '#fffbeb',
            border: '#fde68a',
            DEFAULT: '#f59e0b',
            dark: '#b45309',
            text: '#92400e'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
