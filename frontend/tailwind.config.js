/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102a43",
        mist: "#f6fbff",
        coral: "#ff7a59",
        teal: "#0f766e",
        sand: "#f5efe6",
      },
      boxShadow: {
        panel: "0 20px 45px rgba(16, 42, 67, 0.12)",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
