import {defineConfig} from "vite";
// Plugins
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        "vue",
        {
          pinia: ["defineStore", "storeToRefs"],
        },
      ],
    }),
  ],
});
