import { createApp } from "vue";
import { registerPlugins } from "@/packages/plugin";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

registerPlugins(app);

app.mount("#app");
