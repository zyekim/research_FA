import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
// Plugins
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "pinia"],
      dts: "src/auto-imports.d.ts",
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
    Components({
      dirs: ["src/packages/shared/components"],
    }),
    Vuetify({
      autoImport: true,
      styles: {
        configFile: "@/packages/plugin/vuetify/settings.scss",
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["vuetify", "vue-router"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@shared/styles/variables as *;
          @use "@shared/styles/global/mixin as *;
        `,
      },
    },
  },
});
