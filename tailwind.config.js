/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F6F3EC',
          warm: '#EFECE3',
          deep: '#E5E0D3',
        },
        ink: {
          DEFAULT: '#1C1B18',
          muted: '#3A3832',
        },
        pencil: {
          DEFAULT: '#5C5850',
          light: '#858076',
        },
        stamp: {
          red: '#8C2D19',
          ochre: '#7D5A2B',
          forest: '#2E4A36',
        }
      },
      fontFamily: {
        handwriting: ['OoHandwriting', 'Newsreader', 'Georgia', 'serif'],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
