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
        // bg_secondary: "#005C78",
        // primary_color: "#006989",

        primary_color: "#135D66",
        secondary_color: "#E3FEF7",
        logo_color: "#DC5F00",

        bg_primary_dark: "#003C43",
        bg_primary_lite: "#135D66",
        bg_input: "#E3FEF7",
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
