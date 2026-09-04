/** @type {import('tailwindcss').Config} */
export default {
  // Token contract: violet 262 83% 58% (oklch 0.60 0.20 290) + teal 173 80% 40%, zinc shell, 12/16/20px radii, Inter + Geist Mono
  // Author OKLCH -> export HSL for Tailwind compat. Keep 80:20 violet:teal. Verify contrast 4.5:1 for text.
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        chart1: "hsl(var(--chart-1))",
        chart2: "hsl(var(--chart-2))",
        chart3: "hsl(var(--chart-3))",
        chart4: "hsl(var(--chart-4))",
        chart5: "hsl(var(--chart-5))",
        // semantic finance aliases (keep violet/teal ratio 80:20)
        success: "hsl(var(--chart-2))",
        warning: "hsl(var(--chart-3))",
      },
      borderRadius: {
        // sm 10px inputs/badges, md 12px buttons/rows, lg 16px cards/modals, xl 20px hero, 2xl 24px containers — derive from --radius 0.85rem
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 6px)",
        "2xl": "calc(var(--radius) + 10px)",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], mono: ["Geist Mono", "JetBrains Mono", "monospace"] },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-from-bottom-2": { from: { transform: "translateY(8px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 150ms ease-out",
        "slide-in-from-bottom-2": "slide-in-from-bottom-2 200ms ease-out",
      },
    },
  },
  plugins: [],
}
