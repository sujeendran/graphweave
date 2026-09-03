import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-rose": "glowRose 2s ease-in-out infinite alternate",
        "glow-amber": "glowAmber 2.5s ease-in-out infinite alternate",
        "glow-indigo": "glowIndigo 2.5s ease-in-out infinite alternate",
      },
      keyframes: {
        glowRose: {
          "0%": { boxShadow: "0 0 10px rgba(244, 63, 94, 0.2), inset 0 0 10px rgba(244, 63, 94, 0.1)" },
          "100%": { boxShadow: "0 0 24px rgba(244, 63, 94, 0.6), inset 0 0 15px rgba(244, 63, 94, 0.3)" },
        },
        glowAmber: {
          "0%": { boxShadow: "0 0 8px rgba(245, 158, 11, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.5)" },
        },
        glowIndigo: {
          "0%": { boxShadow: "0 0 8px rgba(99, 102, 241, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
