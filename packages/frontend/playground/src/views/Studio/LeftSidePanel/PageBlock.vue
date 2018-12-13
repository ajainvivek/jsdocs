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
import { find, filter, startCase } from 'lodash';

@Component({
    components: {
    },
})
export default class PageBlock extends Vue {

    mounted() {
        window.createNewPage = () =>{
            this.createPage(); 
        }
    }

    private createPage() {
        const sourceCode = this.$store.state.builder.sourceCode;
        const pageSettings = {
            pagename: 'hello',
            pagepath: '/hello'
        };
        this.$store.dispatch('builder/createPage', {
            settings: pageSettings,
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