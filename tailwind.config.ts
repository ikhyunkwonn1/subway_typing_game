import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NYC Subway line colors
        line: {
          l: '#A7A9AC',
          '1': '#EE352E',
          w: '#FCCC0A',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
