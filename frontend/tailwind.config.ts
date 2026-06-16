import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1326", // Deep Midnight
        surface: {
          DEFAULT: "#171f33", // Card Slate
          dim: "#0b1326",
          bright: "#31394d",
          container: {
            lowest: "#060e20",
            low: "#131b2e",
            DEFAULT: "#171f33",
            high: "#222a3d",
            highest: "#2d3449",
          }
        },
        primary: {
          DEFAULT: "#00d4ff", // Neon Cyan
          glow: "#00d4ff",
          dim: "#3cd7ff",
          fixed: "#b4ebff",
        },
        secondary: {
          DEFAULT: "#c5c2f0", // Lavender Accent
          dim: "#c5c2f0",
          fixed: "#e2dfff",
        },
        tertiary: {
          DEFAULT: "#00fea2", // Bio-Green
          dim: "#00e290",
          fixed: "#52ffac",
        },
        status: {
          normal: "#00FFA3",  // Neon Green
          warning: "#FFD700", // Neon Gold
          critical: "#FF3131", // Neon Red
        },
        border: "#3c494e",
        outline: "#859398",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "Sora", "sans-serif"],
        hanken: ["var(--font-hanken)", "Hanken Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "16px",
        md: "8px",
        sm: "4px",
      },
      boxShadow: {
        neon: "0 0 12px var(--tw-shadow-color)",
      }
    },
  },
  plugins: [],
};
export default config;
