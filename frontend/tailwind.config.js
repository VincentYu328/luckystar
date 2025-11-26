/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./src/lib/**/*.{svelte,js,ts}",
    "./src/routes/**/*.{svelte,js,ts}",
    "./src/app.html"
  ],

  theme: {
    extend: {
      fontFamily: {
        serif: ['"Book Antiqua"', 'Georgia', 'serif'],
        body: ['"Book Antiqua"', 'Georgia', 'serif'],
        heading: ['"Book Antiqua"', 'Georgia', 'serif']
      },

      container: {
        center: true,
        padding: '1.25rem'
      },

      colors: {
        brand: {
          primary:   '#0C3C78', // 深海蓝（与你 app.css 主题一致）
          secondary: '#1A73B7', // 太平洋蓝
          accent:    '#8FA3B8', // ⭐ app.css 用到的 brand-accent（必须加）
          light:     '#F7F9FC',
          dark:      '#1A1A1A'
        }
      },

      borderRadius: {
        xl: "1rem"
      },

      boxShadow: {
        card: "0 4px 14px rgba(0,0,0,0.08)",
        soft: "0 1px 6px rgba(0,0,0,0.05)"
      }
    }
  },

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography")
  ]
};
