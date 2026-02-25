/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */
// Types
import type { App } from "vue";

// pinia
import { createPinia } from "pinia";
import piniaPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPersistedstate);

// vuetify
import vuetify from "./vuetify";

export function registerPlugins(app: App) {
  app.use(vuetify);
  app.use(pinia);
}
