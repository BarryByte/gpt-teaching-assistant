/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          light: '#818CF8',   // Indigo 400
          dark: '#3730A3',    // Indigo 800
        },
        // Secondary colors
        secondary: {
          DEFAULT: '#10B981', // Emerald 500
          light: '#34D399',   // Emerald 400
          dark: '#059669',    // Emerald 600
        },
        // Accent colors
        accent: {
          DEFAULT: '#F59E0B', // Amber 500
          light: '#FBBF24',   // Amber 400
          dark: '#D97706',    // Amber 600
        },
        // Background colors
        background: {
          light: '#F9FAFB',   // Gray 50
          dark: '#111827',    // Gray 900
        },
        // Surface colors
        surface: {
          light: '#FFFFFF',   // White
          dark: '#1F2937',    // Gray 800
          'alt-light': '#F3F4F6', // Gray 100
          'alt-dark': '#374151',  // Gray 700
        },
        // Text colors
        text: {
          'primary-light': '#1F2937', // Gray 800
          'primary-dark': '#F9FAFB',  // Gray 50
          'secondary-light': '#6B7280', // Gray 500
          'secondary-dark': '#9CA3AF',  // Gray 400
          'muted-light': '#9CA3AF',     // Gray 400
          'muted-dark': '#6B7280',      // Gray 500
        },
        // Legacy colors for backward compatibility
        gray: {
          650: '#2D3748',
          750: '#1A202C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'button': '0 2px 4px rgba(79, 70, 229, 0.2)',
        'card-light': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 2px 4px rgba(0, 0, 0, 0.2)',
        'sidebar-light': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'sidebar-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text.primary-light'),
            a: {
              color: theme('colors.primary.DEFAULT'),
              '&:hover': {
                color: theme('colors.primary.dark'),
              },
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              fontFamily: theme('fontFamily.mono'),
              backgroundColor: theme('colors.surface.alt-light'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.text.primary-dark'),
            a: {
              color: theme('colors.primary.light'),
              '&:hover': {
                color: theme('colors.primary.DEFAULT'),
              },
            },
            code: {
              backgroundColor: theme('colors.surface.alt-dark'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/scrollbar')
  ],
};