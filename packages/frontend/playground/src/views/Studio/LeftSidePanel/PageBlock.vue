<template>
	<div class="page-block-wrapper">
		<div v-for="page in pages" :key="page.id" @click="updateSelectedPage(page)">
			<Card class="card" shadow :class="{ selected: selectedPage.id === page.id }">
				<h3>{{page.name}}</h3>
			</Card>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { find, filter, startCase, uniqBy, upperFirst, merge  } from 'lodash';
import { uniqueStringId, dasherize } from '@/helpers';

@Component({
    components: {
    },
})
export default class PageBlock extends Vue {

    mounted() {
        let activeUiKit = this.$store.state.builder.activeUiKit;
        let components = this.$store.state.builder.components;
        components = components.filter(component => {
            return component.visible === true;
        });
        // if current active uikit then create page blocks 
        if(components[0] && components[0].uikit !== activeUiKit) {
            // set the active ui kit
            this.$store.dispatch('builder/updateActiveUiKit', components[0].uikit);
            this.createPages(components);
        }
    }

    private createPages(components) {
        const sourceCode = this.$store.state.builder.sourceCode;
        const pages = [];
        components.forEach(component => {
            let page: any = {};
            page.template = {
                name: component.name,
                node: 'page',
                element: 'div',
                data: {},
                properties: {},
                children: this.injectComponent(component)
            };
            console.log(page.template);
            page.path = `/${dasherize(component.name)}`;
            pages.push(page);
        });
        this.$store.dispatch('builder/createPages', {
            pages,
            sourceCode,
        });
    }

    private updateSelectedPage(page) {
        const sourceCode = this.$store.state.builder.sourceCode;
        const isHashRoute = sourceCode.isHashRoute;
        const frame = <HTMLIFrameElement>document.getElementById('sandbox');
        frame.contentWindow.postMessage(
            { type: 'route-change', isHash: isHashRoute, codesandbox: true, path: page.path },
            '*',
        );
        this.$store.dispatch('builder/updateCurrentView', page);
    }

    get pages() {
        const sourceCode = this.$store.state.builder.sourceCode;
        let pages = [];
        if (sourceCode) {
            const pageDir: any = find(sourceCode.directories, {
                title: 'pages',
            });

            const modules: any = filter(sourceCode.modules, {
                directory_shortid: pageDir.shortid,
            });
            pages = modules.map(module => {
                module.name = startCase(module.title.replace(/\.[^/.]+$/, ''));
                return module;
            });
        }
        return pages;
    }

    get selectedPage() {
        let selectedPage = {};
        const activeDirectory = this.$store.state.builder.activeDirectory;
        if (activeDirectory === 'page') {
            selectedPage = this.$store.state.builder.currentView || this.pages[0];
        }
        return selectedPage;
    }

    private injectComponent(component) {
        const currentView = this.$store.state.builder.currentView;
        const { id, directory_shortid } = currentView;
        let children = [];
        const sid = uniqueStringId();
        const defaultValue = Object.assign({}, component.default);
        component = merge(
            {
                id: sid,
                name: component.name,
                node: 'container',
                element: component.element,
                uikit: component.uikit,
                native: component.native,
            },
            {
                properties: {
                    [`data-${sid}`]: true,
                    class: [sid],
                },
            },
            defaultValue,
        );
        children.push(component);
        return children;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.card {
    text-align: center;
    margin: 8px 0;
    cursor: pointer;

    &.empty {
        border: 1px dashed #ccc;
        background: transparent;
    }

    h3 {
        font-weight: 400;
    }
}

.selected,
.selected:hover {
    border: 1px solid #1579b3 !important;
    transition: border-color 1s ease;
}
</style>