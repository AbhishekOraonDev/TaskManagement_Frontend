const plugin = require('tailwindcss/plugin')
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
    },
  },
  plugins: [
    addVariablesForColors,
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-grid": (value) => ({
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='${value.replace('#', '%23')}'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E")`,
          }),
          "bg-grid-small": (value) => ({
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='8' height='8' fill='none' stroke='${value.replace('#', '%23')}'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E")`,
          }),
          "bg-dot": (value) => ({
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='${value.replace('#', '%23')}' id='pattern-circle' cx='10' cy='10' r='1.6257413380501518'%3E%3C/circle%3E%3C/svg%3E")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    }),
  ],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}