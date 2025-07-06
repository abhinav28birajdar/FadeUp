const { nativewind } = require("nativewind/preset");

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [nativewind],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'dark-background': '#121212',
        'dark-card': '#27272A',
        'dark-border': '#52525B',
        'primary-light': '#F3F4F6',
        'secondary-light': '#A1A1AA',
        'accent-primary': '#8B5CF6',
        'accent-secondary': '#38BDF8',
        'status-pending': '#F97316',
        'status-confirmed': '#3B82F6',
        'status-completed': '#10B981',
        'status-cancelled': '#EF4444',
      },
    },
  },
  plugins: [],
};

module.exports = config;
module.exports.default = config;