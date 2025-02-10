import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';


const app = createApp(App);
app.use(router);
app.mount('#app');

app.use(VueToast);
//Vue.$toast.open({/* options */});
let instance = app.$toast.open('You did it!');

// Force dismiss specific toast
instance.dismiss();
// Dismiss all opened toast immediately
app.$toast.clear();