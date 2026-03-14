import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        warm: {
          50: '#fdfcfb',
          100: '#faf6f1',
          200: '#f5ede3',
          300: '#ede0cf',
          400: '#e0ccb0',
          500: '#d4b896',
          600: '#c49e74',
          700: '#a87f56',
          800: '#8a6644',
          900: '#6e5137',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7cfc7',
          300: '#a3b0a3',
          400: '#7e8f7e',
          500: '#637363',
          600: '#4e5c4e',
          700: '#404b40',
          800: '#363e36',
          900: '#2e342e',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
