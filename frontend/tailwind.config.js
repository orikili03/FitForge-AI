/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                ds: {
                    bg: "#0a0908",
                    "bg-subtle": "#0f0e0d",
                    surface: "#171614",
                    "surface-subtle": "#1c1a18",
                    "surface-hover": "#292524",
                    border: "#292524",
                    "border-strong": "#3f3c39",
                    text: "#fafaf9",
                    "text-secondary": "#d6d3d1",
                    "text-muted": "#78716c",
                    "text-faint": "#57534e",
                    accent: "#fbbf24",
                    "accent-hover": "#fcd34d",
                },
            },
            fontFamily: {
                sans: ["system-ui", "ui-sans-serif", "sans-serif"],
                display: ["system-ui", "ui-sans-serif", "sans-serif"],
            },
            fontSize: {
                "ds-caption": ["0.75rem", { lineHeight: "1.125rem" }],
                "ds-body-sm": ["0.875rem", { lineHeight: "1.25rem" }],
                "ds-body": ["1rem", { lineHeight: "1.5rem" }],
                "ds-heading": ["1.125rem", { lineHeight: "1.5rem" }],
                "ds-title": ["1.5rem", { lineHeight: "2rem" }],
                "ds-display": ["1.875rem", { lineHeight: "2.25rem" }],
                "ds-stat": ["1.5rem", { lineHeight: "1.75rem" }],
            },
            spacing: {
                "ds-1": "8px",
                "ds-2": "16px",
                "ds-3": "24px",
                "ds-4": "32px",
                "ds-5": "40px",
                "ds-6": "48px",
                "ds-8": "64px",
                "ds-10": "80px",
            },
            borderRadius: {
                "ds-sm": "8px",
                "ds-md": "12px",
                "ds-lg": "16px",
                "ds-xl": "20px",
                "ds-2xl": "24px",
            },
            boxShadow: {
                "ds-sm": "0 0 0 1px rgba(255,255,255,0.02), 0 2px 4px rgba(0,0,0,0.14)",
                "ds-md": "0 0 0 1px rgba(255,255,255,0.03), 0 4px 12px rgba(0,0,0,0.16)",
                "ds-lg": "0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.18)",
            },
            backgroundImage: {
                "ds-stat-red": "linear-gradient(160deg, rgba(248,113,113,0.14) 0%, rgba(239,68,68,0.08) 100%)",
                "ds-stat-orange": "linear-gradient(160deg, rgba(251,146,60,0.14) 0%, rgba(249,115,22,0.08) 100%)",
                "ds-stat-blue": "linear-gradient(160deg, rgba(96,165,250,0.14) 0%, rgba(59,130,246,0.08) 100%)",
                "ds-stat-pink": "linear-gradient(160deg, rgba(244,114,182,0.14) 0%, rgba(236,72,153,0.08) 100%)",
            },
            transitionDuration: { 250: "250ms" },
        },
    },
    plugins: [],
};
