import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dialog } from 'quasar'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import 'golden-layout/src/less/themes/goldenlayout-light-theme.less'
import 'golden-layout/src/less/goldenlayout-base.less'
// import '../node_modules/golden-layout/dist/css/themes/goldenlayout-base.css'
import 'v-calendar/dist/style.css'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(Quasar, {
    plugins: {Dialog}
})
app.mount('#app')
