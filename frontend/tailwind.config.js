/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arbitrum: {
          blue: "#28A0F0",
          navy: "#121B44",
          dark: "#0b1021",
          cyan: "#20C997",
          accent: "#96BEDC",
        },
      },
    },
  },
  plugins: [],
}
