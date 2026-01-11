/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Zinc 950
        surface: "#18181b",    // Zinc 900
        foreground: "#fafafa", // Zinc 50
        card: {
          DEFAULT: "#18181b",  // Zinc 900
          foreground: "#fafafa", // Zinc 50
        },
        primary: {
          DEFAULT: "#fafafa",  // Zinc 50
          foreground: "#18181b", // Zinc 900
          hover: "#e4e4e7",    // Zinc 200
        },
        secondary: {
          DEFAULT: "#27272a",  // Zinc 800
          foreground: "#fafafa", // Zinc 50
          hover: "#3f3f46",    // Zinc 700
        },
        accent: {
          DEFAULT: "#27272a", // Zinc 800
          foreground: "#fafafa",
        },
        muted: {
          DEFAULT: "#27272a", // Zinc 800
          foreground: "#a1a1aa", // Zinc 400
        },
        border: "#27272a",     // Zinc 800
        input: "#27272a",      // Zinc 800
        ring: "#d4d4d8",       // Zinc 300
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
