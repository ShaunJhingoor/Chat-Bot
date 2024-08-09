/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        spin: {
          '0%': {
            transform: 'rotate(0deg)',
            opacity: '100%',
          },
          '50%': {
            transform: 'rotate(360deg)',
            opacity: '100%',
          },
          '100%': {
            transform: 'rotate(520deg)',
            opacity: '100%',
          },
        }
      },
      animation: {
        customSpin: 'spin 3s cubic-bezier(0,1.01,1,.42) infinite',
      },
    },
  },
  plugins: [],
};
