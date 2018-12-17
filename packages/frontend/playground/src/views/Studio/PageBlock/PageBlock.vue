<template>
	<div class="page-block-wrapper">
        <Input search placeholder="Search..." />
        <div class="item-wrapper" v-for="category in categories" :key="category.id">
			<h4>{{category.name}}</h4>
			<div class="items">
                <div v-for="component in getCategoryItems(category.id)" :key="component.id" @click="updateSelectedPage(component)">
					<Card class="card" shadow :class="{ selected: selectedPage.id === getSelectedPage(component).id }">
						<div class="title">
							<Icon :type="component.icon" class="icon" size="16" />
							<h4 class="text">{{component.title}}</h4>
						</div>
						<p class="desc">{{component.info}}</p>
					</Card>
				</div>
            </div>
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

    get components() {
        const components = this.$store.state.builder.components;
        return components.filter(component => {
            return component.visible === true;
        });
    }

    mounted() {
        let activeUiKit = this.$store.state.builder.activeUiKit;
        let components = this.components;

        // if current active uikit then create page blocks 
        if(components[0] && components[0].uikit !== activeUiKit) {
            // set the active ui kit
            this.$store.dispatch('builder/updateActiveUiKit', components[0].uikit);
            this.createPages(components);
        }
    }

    private getCategoryItems(category) {
        const components = this.components;
        return filter(components, {
            category,
        });
    }

    get categories() {
        const components = this.components;

        const categories = uniqBy(components, 'category').map(item => {
            let component: any = item;
            return {
                id: component.category,
                name: upperFirst(component.category),
            };
        });
        return categories;
    }

    private getSelectedPage(component) {
        let pages = this.pages;

        let page = pages.find(page => {
            return component.name === page.name;
        });

        return page;
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
                children: this.injectComponent(component),
            };
            page.path = `/${dasherize(component.name)}`;
            pages.push(page);
        });
        this.$store.dispatch('builder/createPages', {
            pages,
            sourceCode,
        });
    }

    private updateSelectedPage(component) {
        const sourceCode = this.$store.state.builder.sourceCode;
        const isHashRoute = sourceCode.isHashRoute;
        const frame = <HTMLIFrameElement>document.getElementById('sandbox');
        const page = this.getSelectedPage(component);
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

.page-block-wrapper {
    padding: 5px 0;
}

.card {
    margin: 8px 0;
    cursor: pointer;

    &.empty {
        border: 1px dashed #ccc;
        background: transparent;
    }

    h4 {
        font-weight: 600;
    }

    .title {
        display: inline-block;
        width: 100%;
        height: 20px;

        .icon {
            float: left;
            line-height: 22px;
        }

        .text {
            float: left;
            padding: 0 10px;
        }

        span {
            float: right;
            font-size: 10px;
            text-transform: capitalize;
            color: #8a909d;
            font-weight: 500;
        }
    }

    .desc {
        font-size: 12px;
        color: #979797;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-left: 26px;
    }
}

.selected,
.selected:hover {
    border: 1px solid #1579b3 !important;
    transition: border-color 1s ease;
}

.item-wrapper {
    padding: 10px 0;

    h4 {
        padding: 0 5px;
        color: #929292;
        font-weight: 500;
    }
}
</style>