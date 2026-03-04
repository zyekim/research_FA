import { createApp } from "vue";
import App from "./App.vue";
import router from "./packages/router";

// plugin
import { registerPlugins } from "@/packages/plugin";

// style
import "@shared/styles/index.scss";

const app = createApp(App);
registerPlugins(app);
app.use(router);
app.mount("#app");
