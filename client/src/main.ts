import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dialog } from 'quasar'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import 'golden-layout/src/less/themes/goldenlayout-light-theme.less'
import 'golden-layout/src/less/goldenlayout-base.less'
// import '../node_modules/golden-layout/dist/css/themes/goldenlayout-base.css'

import App from './App.vue'
import router from './router'

let dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const app = createApp(App)

app.provide("dark", dark)

app.use(createPinia())
app.use(Quasar, {
    plugins: {Dialog}
})
app.use(router)

app.mount('#app')