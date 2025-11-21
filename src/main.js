import { createApp } from 'vue'
import App from './App.vue'
import router from './router'                // <— agora existe src/router/index.js

import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/main.css'                   // <— seu CSS está em src/assets/main.css

createApp(App).use(router).mount('#app')
