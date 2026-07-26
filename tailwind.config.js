/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "../../../vertez/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        sourceSerif: ["Source Serif 4", "serif"],
        jetbrainsMono: ["JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.02em",
        tight: "-0.01em",
        wide: "0.02em",
      },
      lineHeight: {
        relaxed: "1.6",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};