/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors (Cyan/Teal - modern and clean)
        primary: {
          DEFAULT: '#22D3EE', // Cyan 400
          light: '#67E8F9',   // Cyan 300
          dark: '#06B6D4',    // Cyan 500
        },
        // Secondary colors (Emerald)
        secondary: {
          DEFAULT: '#10B981', // Emerald 500
          light: '#34D399',   // Emerald 400
          dark: '#059669',    // Emerald 600
        },
        // Accent colors (Amber for highlights)
        accent: {
          DEFAULT: '#F59E0B', // Amber 500
          light: '#FCD34D',   // Amber 300
          dark: '#D97706',    // Amber 600
        },
        // Background colors (True dark-black)
        background: {
          light: '#FAFAFA',   // Near white
          dark: '#0A0A0A',    // True black
        },
        // Surface colors (Dark grays)
        surface: {
          light: '#FFFFFF',   // White
          dark: '#141414',    // Very dark gray
          'alt-light': '#F5F5F5', // Light gray
          'alt-dark': '#1C1C1C',  // Dark gray
        },
        // Text colors
        text: {
          'primary-light': '#171717', // Near black
          'primary-dark': '#FAFAFA',  // Near white
          'secondary-light': '#525252', // Gray 600
          'secondary-dark': '#A3A3A3',  // Gray 400
          'muted-light': '#737373',     // Gray 500
          'muted-dark': '#525252',      // Gray 600
        },
        // Legacy colors for backward compatibility
        gray: {
          650: '#2D3748',
          750: '#1A202C',
          850: '#0F0F0F',
          950: '#050505',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
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