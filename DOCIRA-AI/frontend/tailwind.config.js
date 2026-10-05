/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          glass: "var(--bg-glass)",
        },

        accent: {
          DEFAULT: "#6366f1",
          secondary: "#8b5cf6",
          glow: "rgba(99,102,241,0.18)",
        },

        border: {
          DEFAULT: "var(--border)",
          active: "var(--border-active)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },

        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "glass": "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)",

        "accent-gradient":
          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",

        "sidebar-gradient":
          "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      },
      boxShadow: {
        "glass":
          "0 4px 24px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",

        "accent":
          "0 8px 24px rgba(99,102,241,0.18)",

        "card":
          "0 8px 32px rgba(15,23,42,0.08)",
      },
      borderRadius: {
        "xl2": "1rem",
        "xl3": "1.5rem",
      },
    },
  },
  plugins: [],
};