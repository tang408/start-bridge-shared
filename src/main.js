import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

// 引入 Quill 樣式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

// 引入全域樣式（包含上面的 Quill 覆蓋樣式）
import '@/assets/styles/scss/style.scss';

const app = createApp(App);

app.use(router);
app.mount("#app");
