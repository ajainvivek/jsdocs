import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from '@/store';
import './registerServiceWorker';
import iView from 'iview';
import './assets/iview.css';
import VueAnalytics from 'vue-analytics';

Vue.use(iView);
Vue.use(VueAnalytics, {
    id: 'UA-131507096-1',
});

declare global {
    interface Window {
        eventBus: any;
    }
}

window.eventBus = new Vue();
Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
