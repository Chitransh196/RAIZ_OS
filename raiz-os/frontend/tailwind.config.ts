import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Hint level colors (used in JS object literals — not statically scannable)
    'text-accent-cyan',   'border-accent-cyan/30',   'bg-accent-cyan/5',   'bg-accent-cyan/10',
    'text-accent-purple', 'border-accent-purple/30', 'bg-accent-purple/5', 'bg-accent-purple/10',
    'text-accent-orange', 'border-accent-orange/30', 'bg-accent-orange/5', 'bg-accent-orange/10',
    'text-accent-pink',   'border-accent-pink/30',   'bg-accent-pink/5',   'bg-accent-pink/10',
    'text-accent-green',  'border-accent-green/30',  'bg-accent-green/5',  'bg-accent-green/10',
    'text-accent-red',    'border-accent-red/30',    'bg-accent-red/5',    'bg-accent-red/10',
    'bg-accent-green', 'bg-accent-cyan', 'bg-accent-orange', 'bg-accent-red', 'bg-accent-purple',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#050816",
          panel: "#0B1120",
          card: "#0D1530",
          hover: "#111827",
        },
        accent: {
          purple: "#7C3AED",
          cyan: "#22D3EE",
          green: "#10B981",
          orange: "#F59E0B",
          red: "#EF4444",
          pink: "#EC4899",
        },
        border: {
          dim: "#1E293B",
          glow: "#7C3AED33",
          cyan: "#22D3EE33",
        },
        text: {
          primary: "#F1F5F9",
          secondary: "#94A3B8",
          muted: "#475569",
          accent: "#7C3AED",
          cyan: "#22D3EE",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
        display: ["'Orbitron'", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)",
        "glow-purple":
          "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
        "glow-cyan":
          "radial-gradient(ellipse at center, rgba(34,211,238,0.1) 0%, transparent 70%)",
        "panel-gradient":
          "linear-gradient(135deg, rgba(11,17,32,0.9) 0%, rgba(13,21,48,0.95) 100%)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.1)",
        "glow-cyan": "0 0 20px rgba(34,211,238,0.4), 0 0 60px rgba(34,211,238,0.1)",
        "glow-green": "0 0 20px rgba(16,185,129,0.4)",
        "glow-sm": "0 0 8px rgba(124,58,237,0.3)",
        panel: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "panel-hover": "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "scan-line": "scanLine 4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "border-flow": "borderFlow 3s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        borderFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
