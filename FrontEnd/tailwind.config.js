/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F5F2",
        surface: "#FFFFFF",
        surface2: "#F0F0EC",
        border: "#E2E2DD",
        border2: "#CACAC4",
        accent: "#2E7D4F",
        "accent-hi": "#389960",
        "accent-bg": "#EBF5EF",
        text: "#1C1C1A",
        muted: "#5C5C57",
        dim: "#9E9E98",
      },
      fontFamily: {
        sans: ["Arial", '"Helvetica Neue"', "Helvetica", "sans-serif"],
        mono: ['"Courier New"', "Courier", "monospace"],
      },
      animation: {
        "spin-slow": "spin 14s linear infinite",
        "fade-in": "fadeIn 0.3s ease",
        "slide-up": "slideUp 0.3s ease",
        "pulse-soft": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
