/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#936137", // برونزي
        secondary: "#FFFFFF", // أبيض
        accent: "#FFF8F0", // كريمي
        dark: "#3D1F0A", // بني غامق
        border: "rgba(147, 97, 55, 0.2)",
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      keyframes: {
        flicker: {
          "0%, 100%": { transform: "rotate(-2deg) scale(1)" },
          "25%": { transform: "rotate(2deg) scale(1.05)" },
          "50%": { transform: "rotate(-1deg) scale(0.97)" },
          "75%": { transform: "rotate(3deg) scale(1.03)" },
        },
      },
      animation: {
        flicker: "flicker 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
