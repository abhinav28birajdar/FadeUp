/** @type {import('tailwindcss').Config} */
const config = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#151515',
        border: '#2F2F2F',
        
        primary: '#E7E9EA',
        secondary: '#71767B',

        accent: '#38BDF8',

        'status-pending': '#F97316',
        'status-confirmed': '#3B82F6',
        'status-completed': '#10B981',
        'status-cancelled': '#EF4444',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};

module.exports = config;
