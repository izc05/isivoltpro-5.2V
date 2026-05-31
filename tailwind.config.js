import colors from "./src/theme/colors.ts";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        primaryDark: colors.primaryDark,
        accent: colors.accent,
        accentSoft: colors.accentSoft,
        appBg: colors.background,
        card: colors.card,
        appText: colors.text,
        danger: colors.danger,
        warning: colors.warning,
        info: colors.info,
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.12)",
        nav: "0 -18px 45px rgba(0, 13, 36, 0.35)",
      },
      borderRadius: {
        app: "28px",
      },
    },
  },
  plugins: [],
};
