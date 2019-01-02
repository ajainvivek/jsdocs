import { find, compact, remove, merge, pickBy, identity } from 'lodash';
import { generatePage, generateRoute, generatePlugins, updatePage, recursiveComponentUpdate } from '@/helpers';

interface PageLayout {
    id: number;
    img: string;
    title: string;
}

// Initial State
const state = {
    pageTree: [],
    isLayoutDrawerOpen: false,
    currentView: null,
    sourceCode: null,
    sandboxFrame: null,
    activeDirectory: 'page',
    newPageSettings: {},
    uikits: [],
    components: [],
    lang: 'vue',
    selectedNode: {},
    activeUiKit: '',
};

// Getters - to compute derived state based on store state, for example filtering through a list of items
const getters = {
    selectedComponent(state): any {
        const selected = state.selectedNode || null;
        let selectedComponent: any = {};
        if (selected && selected.data) {
            const filter = pickBy(
                {
                    name: selected.data.name,
                    uikit: selected.data.uikit,
                },
                identity,
            );
            selectedComponent = find(state.components, filter);
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
    // update the list of uikits to display
    updateUiKits(state, uikits) {
        state.uikits = uikits;
    },
    // update source code
    resetSourceCode(state, sourceCode) {
        state.sourceCode = sourceCode;
        state.components = [];
        state.currentView = null;
        state.activeUiKit = '';
        state.selectedNode = {};
    },
    removeAllPages(state) {
        const pageDirectory: any = find(state.sourceCode.directories, {
            title: 'pages',
        });

        // append all the pages and exclude old pages
        state.sourceCode.modules = [
            ...state.sourceCode.modules.filter(module => module.directory_shortid !== pageDirectory.shortid),
        ];
    },
    createPages(state, { pages, router }) {
        const frame = document.getElementById('sandbox') as HTMLIFrameElement;

        if (state.sourceCode && state.sourceCode.modules) {
            // append all the pages and exclude old pages
            state.sourceCode.modules = [...state.sourceCode.modules, ...pages];

            // add router module
            const routerModule: any = find(state.sourceCode.modules, {
                shortid: state.sourceCode.shared.router,
            });
            routerModule.code = router;

            state.sourceCode.modules = [
                ...state.sourceCode.modules.filter(module => module.id !== routerModule.id),
                routerModule,
            ];

            frame.contentWindow!.postMessage({ type: 'raw-compile', raw: state.sourceCode, codesandbox: true }, '*');
            state.currentView = pages[0];
        }
    },
    // update the current view
    updateModuleCode(state, { id, directory_shortid, code, plugin, isRemoveDependency, jsonView }) {
        const frame = document.getElementById('sandbox') as HTMLIFrameElement;
        if (state.sourceCode && state.sourceCode.modules) {
            let pluginsModule: any = null;
            // if comprises all commons external dependency module like css, imgs, icons etc...
            if (plugin) {
                let dependencies = {};
                if (!isRemoveDependency) {
                    dependencies = merge(state.sourceCode.code_dependencies, plugin);
                } else {
                    const pluginKeys = Object.keys(plugin || {});
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
            const module: any = find(state.sourceCode.modules, {
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
                frame.contentWindow!.postMessage(
                    { type: 'raw-compile', raw: state.sourceCode, codesandbox: true },
                    '*',
                );
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
        const lang = 'vue';
        const pages = data.pages.map(page => {
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

            return page;
        });

        // Remove all existing pages
        commit('removeAllPages');

        const router = generateRoute({ pages, sourceCode, lang });

        commit('createPages', {
            pages,
            router,
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
    updateActiveUiKit({ commit, dispatch }, kit) {
        commit('updateActiveUiKit', kit);
    },
    updateUiKits({ commit }, uikits) {
        commit('updateUiKits', uikits);
    },
    resetSourceCode({ commit }, sourceCode) {
        commit('resetSourceCode', sourceCode);
    },
};

export const builder = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
