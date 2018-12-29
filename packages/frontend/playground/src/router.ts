import Vue from 'vue';
import Router from 'vue-router';
import VueAnalytics from 'vue-analytics';

import Studio from './views/Studio';

Vue.use(Router);

const router = new Router({
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

Vue.use(VueAnalytics, {
    id: 'UA-131507096-1',
    router,
    autoTracking: {
        screenview: true,
    },
});

export default router;
