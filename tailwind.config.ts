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
      colors: {
        /* Use var() directly — CSS variables hold oklch values, not hsl tuples.
           Wrapping in hsl() produces invalid CSS and falls back to black on dark
           sections. var() passes the value through unchanged. */
        border:     "var(--border)",
        input:      "var(--input)",
        ring:       "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT:              "var(--sidebar-background)",
          foreground:           "var(--sidebar-foreground)",
          primary:              "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent:               "var(--sidebar-accent)",
          "accent-foreground":  "var(--sidebar-accent-foreground)",
          border:               "var(--sidebar-border)",
          ring:                 "var(--sidebar-ring)",
        },
        "primary-hover": "var(--primary-hover)",
        "accent-soft":   "var(--accent-soft)",
      },
      fontFamily: {
        sans:    ['Rubik', 'system-ui', 'sans-serif'],
        display: ['Rubik', 'system-ui', 'sans-serif'],
        serif:   ['"Frank Ruhl Libre"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elev: 'var(--shadow-elev)',
        gold: 'var(--shadow-gold)',
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-cta':  'var(--gradient-cta)',
        'gradient-gold': 'var(--gradient-gold)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(32px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 oklch(64% 0.118 72 / 0.4)" },
          "50%":      { boxShadow: "0 0 0 16px oklch(64% 0.118 72 / 0)" },
        },
        "hero-pan": {
          "0%":   { transform: "scale(1.05) translateX(0px)" },
          "100%": { transform: "scale(1.12) translateX(-15px)" },
        },
        "line-grow": {
          from: { width: "0" },
          to:   { width: "100%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in-up":     "fade-in-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in":        "fade-in 0.6s ease both",
        "scale-in":       "scale-in 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "slide-up":       "slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "shimmer":        "shimmer 3s linear infinite",
        "float":          "float 4s ease-in-out infinite",
        "pulse-gold":     "pulse-gold 2.5s ease-in-out infinite",
        "hero-pan":       "hero-pan 12s ease-in-out infinite alternate",
        "line-grow":      "line-grow 1s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
