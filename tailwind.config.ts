import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#00c6a2', light: '#00e8be', dark: '#00a885' },
        navy: { DEFAULT: '#0a1628', mid: '#112240', alt: '#0d1e3a' },
        gold: '#f0a500',
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        serif: ['Playfair Display','Georgia','serif'],
      },
    },
  },
  plugins: [],
}
export default config
