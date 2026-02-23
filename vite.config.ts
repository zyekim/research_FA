import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
// Plugins
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import removeConsole from "vite-plugin-remove-console";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "pinia", "vue-router"],
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
        configFile: "src/packages/plugin/vuetify/settings.scss",
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["vuetify", "vue-router"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
      "@shared": fileURLToPath(new URL("src/packages/shared", import.meta.url)),
      "@auth": fileURLToPath(new URL("src/packages/auth", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
    host: true,
  },
  ...(mode != "development" ? [removeConsole()] : []),
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@shared/styles/variables" as *;
          @use "@shared/styles/global/mixin" as *;
        `,
      },
    },
  },
}));
