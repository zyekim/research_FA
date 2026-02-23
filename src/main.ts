import { createApp } from "vue";
import { registerPlugins } from "@/packages/plugin";
import "@shared/styles/index.scss";
import App from "./App.vue";
import router from "./packages/router";
const app = createApp(App);

registerPlugins(app);
app.use(router);
app.mount("#app");
