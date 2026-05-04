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
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        flicker: "flicker 2.4s ease-in-out infinite",
        "toast-in": "toast-in 0.25s ease-out forwards",
        float: "float 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
