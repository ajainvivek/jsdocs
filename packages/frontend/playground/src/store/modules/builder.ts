import pageLayouts from '@/assets/data/layout/all.json';
import baseLayout from '@/assets/data/layout/base.json';
import sourceCode from '@/assets/data/templates/vue-router.json';
import uikit from '@/assets/data/dependencies/uikit/all.json';

import { find, compact, remove, merge } from 'lodash';
import {
    generatePage,
    generateRoute,
    generatePlugins,
    updatePage,
    dasherize,
    recursiveComponentUpdate,
} from '@/helpers';

interface PageLayout {
    id: number;
    img: string;
    title: string;
}

// Initial State
const state = {
    pageTree: baseLayout,
    isLayoutDrawerOpen: false,
    currentView: null,
    sourceCode: sourceCode,
    sandboxFrame: null,
    activeDirectory: 'page',
    currentDrawerView: null,
    newPageSettings: {},
    uikit: uikit.data.uikit,
    components: [],
    lang: 'vue',
    selectedNode: {},
    activeUiKit: ''
};

// Getters - to compute derived state based on store state, for example filtering through a list of items
const getters = {
    pageLayouts(): PageLayout[] {
        return pageLayouts;
    },
    selectedComponent(state): any {
        let selected = (state.selectedNode && state.selectedNode.data) || null;
        let selectedComponent: any = {};
        if (selected) {
            selectedComponent = find(state.components, {
                name: selected.data.name,
                uikit: selected.data.uikit,
            });
            if (selectedComponent) {
                selectedComponent.uuid = selected.id;
                selectedComponent.appliedProperties = selected.data.properties || {};
                selectedComponent.data = selected.data.data || {};
                selectedComponent.actions = selected.data.actions || {};
            }
        }
        return selectedComponent || {};
    },
};

// Mutations - to change state in a store by committing a mutation
const mutations = {
    updateActiveUiKit(state, kit) {
        state.activeUiKit = kit;
    },
    updatePageTree(state, tree) {
        state.pageTree = tree;
    },
    updateLayoutDrawer(state, isDrawer) {
        state.isLayoutDrawerOpen = isDrawer;
    },
    createPages(state, {pages, routes}) {
        let frame = <HTMLIFrameElement>document.getElementById('sandbox');

        if (state.sourceCode && state.sourceCode.modules) {

            // append all the pages
            state.sourceCode.modules = [
                ...state.sourceCode.modules,
                ...pages,
            ];

            // append all the routes
            routes.forEach((route) => {
                let routerModule: any = find(state.sourceCode.modules, {
                    shortid: state.sourceCode.shared.router,
                });
                routerModule.code = route;

                state.sourceCode.modules = [
                    ...state.sourceCode.modules.filter(module => module.id !== routerModule.id),
                    routerModule
                ];
            });
            
            frame.contentWindow!.postMessage({ type: 'raw-compile', raw: state.sourceCode, codesandbox: true }, '*');
            state.currentView = pages[0];
        }
    },
    // update the current view
    updateModuleCode(state, { id, directory_shortid, code, plugin, isRemoveDependency, jsonView }) {
        let frame = <HTMLIFrameElement>document.getElementById('sandbox');
        if (state.sourceCode && state.sourceCode.modules) {
            let pluginsModule: any = null;
            // if comprises all commons external dependency module like css, imgs, icons etc...
            if (plugin) {
                let dependencies = {};
                if (!isRemoveDependency) {
                    dependencies = merge(state.sourceCode.code_dependencies, plugin);
                } else {
                    let pluginKeys = Object.keys(plugin || {});
                    pluginKeys.forEach(key => {
                        if (plugin[key]) {
                            dependencies[key] = remove(state.sourceCode.code_dependencies[key], plugin[key]);
                        }
                    });
                }
                const pluginCode = generatePlugins({ external: dependencies, lang: 'vue' });
                pluginsModule = find(state.sourceCode.modules, {
                    shortid: state.sourceCode.shared.plugins,
                });
                pluginsModule.code = pluginCode;
            }
            let module: any = find(state.sourceCode.modules, {
                id,
                directory_shortid,
            });
            module.code = code; 
            if (jsonView) {
                module.json_buffer = btoa(JSON.stringify(jsonView));
            }
            state.sourceCode.modules = compact([
                ...state.sourceCode.modules.filter(module => module.id !== id),
                module,
                pluginsModule,
            ]);
            state.currentView = module;
            if (frame && frame.contentWindow) {
                frame.contentWindow!.postMessage({ type: 'raw-compile', raw: state.sourceCode, codesandbox: true }, '*');
            }
        }
    },
    // update the new page settings
    updateNewPageSettings(state, settings) {
        state.newPageSettings = settings;
    },
    // reset the page settings
    resetNewPageSettings(state) {
        state.newPageSettings = {};
    },
    // update the active directory
    updateActiveDirectory(state, directory) {
        state.activeDirectory = directory;
    },
    // update the current view
    updateCurrentView(state, module) {
        state.currentView = module;
    },
    // update the current drawer view
    updateCurrentDrawerView(state, view) {
        state.currentDrawerView = view;
    },
    updateSelectedNode(state, node) {
        state.selectedNode = node;
    },
    // add new component to the existing list
    addComponents(state, components) {
        state.components = state.components.concat(components);
    },
    // remove components based on the filter
    removeComponents(state, filter) {
        state.components = state.components.filter(component => {
            return component.uikit === filter.id;
        });
    },
};

// Actions - actions commit mutations, can contain arbitrary asynchronous operations
const actions = {
    createPages({ commit }, data) {
        const sourceCode = data.sourceCode;
        const pageDirectory: any = find(sourceCode.directories, {
            title: 'pages',
        });
        const routes: any = [];
        const lang = 'vue';
        const pages = data.pages.map((page) => {
            const name = page.template.name;
            const path = page.path;
            page = generatePage({
                template: page.template,
                source_id: sourceCode.source_id,
                name,
                directory_shortid: pageDirectory.shortid,
                path,
                lang, // TODO fetch based on lang
            });
            
            // push route 
            const route = generateRoute({ page, sourceCode, lang });
            routes.push(route);

            return page;
        });
        
        commit('createPages', {
            pages,
            routes
        });
    },
    updateModuleCode({ commit }, { id, directory_shortid, code, plugin, isRemoveDependency, jsonView }) {
        if (code || jsonView) {
            if (jsonView) {
                code = updatePage({ template: jsonView, lang: 'vue' });
            }
            commit('updateModuleCode', {
                id,
                directory_shortid,
                code,
                plugin,
                isRemoveDependency,
                jsonView,
            });
        }
    },
    updateActiveDirectory({ commit }, directory) {
        commit('updateActiveDirectory', directory);
    },
    updateCurrentView({ commit }, module) {
        commit('updateCurrentView', module);
    },
    updateNewPageSettings({ commit }, settings) {
        commit('updateNewPageSettings', settings);
    },
    updateCurrentDrawerView({ commit }, view: string) {
        commit('updateCurrentDrawerView', view);
    },
    addComponents({ commit }, components) {
        commit('addComponents', components);
    },
    removeComponents({ commit }, filter) {
        commit('removeComponents', filter);
    },
    updateSelectedNode({ commit }, node) {
        commit('updateSelectedNode', node);
    },
    // update the selected component properties
    updateComponentData({ commit, dispatch }, component) {
        const { id, directory_shortid } = component.currentView;
        const json: any = JSON.parse(atob(component.currentView.json_buffer));

        // Find the components from the list || nested children
        json.children = recursiveComponentUpdate(
            json.children,
            {
                id: component.id,
            },
            component,
        );

        dispatch('updateModuleCode', { id, directory_shortid, jsonView: json });
    },
    updateActiveUiKit({commit, dispatch}, kit) {
        commit('updateActiveUiKit', kit);
    }
};

export const builder = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
