import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        sans: ['Iberdrola', 'Figtree', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Iberdrola', 'Figtree', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        /* Sombras del Iberdrola Design System (tinte forest suave) */
        'ib-xs': '0 1px 2px rgba(1, 61, 40, 0.06)',
        'ib-sm': '0 2px 8px rgba(1, 61, 40, 0.08)',
        'ib-md': '0 8px 24px rgba(1, 61, 40, 0.10)',
        'ib-lg': '0 16px 48px rgba(1, 61, 40, 0.14)',
      },
      colors: {
        /* Tokens de color del Iberdrola Design System (uso directo: text-ib-green-500, bg-ib-forest, …) */
        ib: {
          green: "#00A443",         /* green-500 PRIMARY */
          "green-50": "#EAF7EF",
          "green-100": "#CDEBD9",
          "green-500": "#00A443",
          "green-700": "#00823A",   /* hover/active */
          "green-900": "#004A2F",   /* deep forest */
          forest: "#004A2F",
          orange: "#FF9C1A",
          blue: "#0DA9FF",
          "tint-mint": "#E8F3EC",
          "tint-peach": "#FCEFE3",
          "tint-sky": "#E7F4FC",
          "tint-sand": "#FBF6EC",
        },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "100px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
