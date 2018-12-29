import Vue from 'vue';
import Router from 'vue-router';
import Studio from './views/Studio';
import ga from 'vue-ga';

ga(Router, 'UA-131507096-1');

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'uikits',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "about" */ './views/UiKits'),
        },
        {
            path: '/studio',
            name: 'studio',
            component: Studio,
        },
    ],
});
