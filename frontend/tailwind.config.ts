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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          50: '#fef5ff',
          100: '#fce8ff',
          200: '#f9d1ff',
          300: '#f5aaff',
          400: '#ee73ff',
          500: '#e03cff',
          600: '#c71aed',
          700: '#a80eca',
          800: '#8b0fa5',
          900: '#721286',
        },
        celebration: {
          gold: '#FFD700',
          rose: '#FF69B4',
          sky: '#87CEEB',
          mint: '#98FF98',
        },
      },
      animation: {
        'spin-slow': 'spin 40s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'confetti': 'confetti 3s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-in forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

