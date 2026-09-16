/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        arbitrum: {
          obsidian: "#060913",
          navy: "#0a1026",
          dark: "#0b1021",
          card: "#0d1633",
          slate: "#152042",
          blue: "#28A0F0",
          neon: "#00E5FF",
          cyan: "#20C997",
          accent: "#96BEDC",
          purple: "#9d4edd",
        },
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse": "spin-reverse 15s linear infinite",
        "laser-scan": "laser 2.5s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        laser: {
          "0%, 100%": { top: "4%", opacity: "0.4" },
          "50%": { top: "92%", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
}

