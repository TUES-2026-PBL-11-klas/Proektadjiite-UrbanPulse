import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        forest: '#1A4731',
        lime: '#7AE653',
        surface: '#F5F5F0',
        'dark-surface': '#111810',
        status: {
          submitted: '#F59E0B',
          'in-progress': '#3B82F6',
          resolved: '#22C55E',
          archived: '#6B7280',
        },
      },
    },
  },
  plugins: [],
}

export default config
