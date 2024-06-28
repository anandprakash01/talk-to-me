/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // primary: "#254336",
        // secondary: "#6B8A7A",
        // bg_primary: "#B7B597",
        // bg_primary: "#76ABAE",
        // bg_primary: "#31363F",
        // bg_secondary: "#DAD3BE",
        primary_color: "#373A40",
        secondary_color: "",
        logo_color: "#DC5F00",
        bg_primary: "#686D76",
        bg_secondary: "#1d2025",
        btn_primary: "#24262b",
        text_bg_primary: "#4f5c5e",
        text_bg_secondary: "#B4B4B8",
      },
      screens: {
        xs: "320px",
        sm: "375px",
        sml: "500px",
        md: "667px",
        mdl: "768px",
        lg: "960px",
        lgl: "1024px",
        xl: "1280px",
      },
      fontFamily: {
        headingFont: "Playwrite Deutschland Grundschrift",
        chatFont: "Playwrite Deutschland Grundschrift",
      },
    },
  },
  plugins: [],
};
