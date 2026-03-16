/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        risk: {
          low: "#22C55E",
          "low-bg": "#F0FDF4",
          borderline: "#EAB308",
          "borderline-bg": "#FEFCE8",
          intermediate: "#F97316",
          "intermediate-bg": "#FFF7ED",
          high: "#EF4444",
          "high-bg": "#FEF2F2",
        },
        level: {
          1: "#93C5FD",
          2: "#60A5FA",
          3: "#3B82F6",
          4: "#1D4ED8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F9FAFB",
          tertiary: "#F3F4F6",
        },
        text: {
          primary: "#111827",
          secondary: "#6B7280",
          tertiary: "#9CA3AF",
        },
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
    },
  },
  plugins: [],
};
