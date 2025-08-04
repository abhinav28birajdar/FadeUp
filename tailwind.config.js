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
        // Base Dark Theme Colors
        'dark-background': '#121212', // Primary deep background for gradients
        'dark-card': '#27272A',     // Zinc 800 - Opaque card background
        'dark-border': '#52525B',   // Zinc 600 - Subtle borders for inputs and cards
        'primary-light': '#F3F4F6', // Gray 100 - Main body and title text (matches 'Up' part of logo)
        'secondary-light': '#A1A1AA', // Gray 400 - Secondary text, descriptions (general purpose)

        // Brand Accent Colors (Inspired by Logo)
        'brand-primary': '#CB9C5E', // Desaturated Gold from Scissors - Main CTA buttons, strong highlights
        'brand-secondary': '#827092', // Muted Purple-Brown - Derived from darks of logo/hat/mustache for secondary accents, links. (Complements gold)
        'text-logo-fade-brown': '#756763', // Specific color from 'Fade' text for optional use (consider contrast on dark bg)

        // Status Indicator Colors
        'status-pending': '#F97316',      // Orange 500
        'status-confirmed': '#3B82F6',    // Blue 500
        'status-completed': '#10B981',    // Emerald 500
        'status-cancelled': '#EF4444',    // Red 500
        'status-in-progress': '#8884d8', // Custom - Purple-Blue, for 'in_progress' queue item
        'status-ready-next': '#fdcf2f',  // Custom - Yellow-Orange, for 'ready_next' queue item
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
