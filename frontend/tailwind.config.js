/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend:  {
      fontFamily: {
        lavishlyYours: ['"Lavishly Yours"', "cursive"],
        greatVibes: ['"Great Vibes"', "cursive"]
      }
    },
  },
  plugins: [],
};
