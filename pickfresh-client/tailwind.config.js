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
        primary: {
          50: "#f0fbf4",
          100: "#dbf6e5",
          200: "#b9edd0",
          300: "#86deac",
          400: "#4ec782",
          500: "#2c9855",
          600: "#2c9855",
          700: "#2c9855",
          800: "#217a42",
          900: "#1c6237",
        },
        citrus: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        ink: {
          50: "#f8faf7",
          100: "#eef3eb",
          200: "#dbe6d6",
          500: "#647067",
          700: "#263328",
          900: "#111b14",
          950: "#07100a",
        },
      },
      boxShadow: {
        soft: "0 16px 48px rgba(15, 23, 42, 0.10)",
        lift: "0 20px 60px rgba(22, 101, 52, 0.16)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
}
