/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        adobe: {
          blue: '#1473E6',
          dark: '#1E1E1E',
          gray: '#505050',
          light: '#F5F5F5',
        },
      },
    },
  },
  plugins: [],
};
