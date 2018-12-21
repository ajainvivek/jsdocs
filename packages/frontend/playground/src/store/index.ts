import Vue from 'vue';
import Vuex from 'vuex';
import localforage from 'localforage';
import VuexPersistence from 'vuex-persist';

const vuexLocal = new VuexPersistence({
    storage: localforage,
});

Vue.use(Vuex);

import { builder } from '@/store/modules/builder';

export default new Vuex.Store({
    modules: {
        builder,
    },
    plugins: [vuexLocal.plugin],
});
