import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50:  "#fff8f0",
          100: "#fff0dc",
          200: "#ffddb3",
          300: "#ffc480",
          400: "#ffa34d",
          500: "#ff8c42",
          600: "#f97316",
          700: "#c2570d",
          800: "#9a4310",
          900: "#7c3810",
        },
        brand: {
          light:   "#fff8f0",
          pale:    "#ffe8cc",
          soft:    "#ffcb99",
          main:    "#ff8c42",
          dark:    "#f97316",
          darker:  "#c2570d",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
