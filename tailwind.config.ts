import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        orange: {
          DEFAULT: "#F97316",
        },
      },
      borderColor: {
        DEFAULT: "#1f1f1f",
      },
    },
  },
  plugins: [],
} satisfies Config;
