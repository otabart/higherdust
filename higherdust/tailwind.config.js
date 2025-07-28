module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#ffffff",
        gray: {
          50: "#f3f3f3",
          100: "#e5e5e5",
          200: "#d4d4d4",
          600: "#666666",
        },
        accent: "#00c389",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        2: "8px", // 8pt grid base
        4: "16px", // 2 * 8pt
        6: "24px", // 3 * 8pt
        8: "32px", // 4 * 8pt
      },
      borderRadius: {
        sm: "2px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
      },
      transitionDuration: {
        150: "150ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
