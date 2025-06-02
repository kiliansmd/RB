import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Vereinheitlichte Farbpalette basierend auf dem Screenshot
        white: "#FFFFFF",
        black: "#000000",
        // Gray Farben aus dem Screenshot
        gray: {
          50: "#F9FAFB",     // Gray 50
          200: "#E5E7EB",    // Gray 200 [Dynamic]
          950: "#030712",    // Gray 950 [Dynamic]
        },
        // Achieve KA - Primäre lila/blaue Farbe
        "achieve-ka": "#6366F1",
        // Achieve Mid - Dunklere lila/blaue Farbe
        "achieve-mid": "#4F46E5",
        // Blue aus dem Screenshot
        blue: {
          DEFAULT: "#3B82F6",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Royal blue-6 aus dem Screenshot
        "royal-blue": "#1E40AF",
        // Yellow aus dem Screenshot
        yellow: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Semantic colors mapped to the screenshot colors
        purple: "#6366F1", // Maps to Achieve KA
        green: "#93CEC0", // Mint-300 - main green
        mint: {
          50: "#EBF8F4",   // mint-50
          100: "#D0EAE2",  // mint-100  
          200: "#B3DCD0",  // mint-200
          300: "#93CEC0",  // mint-300
        },
        red: "#EF4444",   // We keep this for errors
        orange: "#F97316", // We keep this for warnings
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "heading-1": ["3.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-2": ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-3": ["2rem", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-4": ["1.5rem", { lineHeight: "1.4", fontWeight: "700" }],
        "heading-5": ["1.25rem", { lineHeight: "1.5", fontWeight: "700" }],
        "heading-6": ["1rem", { lineHeight: "1.5", fontWeight: "700" }],
        "body-large": ["1.125rem", { lineHeight: "1.6" }],
        "body-normal": ["1rem", { lineHeight: "1.6" }],
        "body-small": ["0.875rem", { lineHeight: "1.5" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
