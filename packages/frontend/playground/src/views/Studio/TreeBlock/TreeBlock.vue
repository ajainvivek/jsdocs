<template>
	<div class="component-tree-block-wrapper">
        <v-tree :data='treeData' @node-select="onNodeSelected"/>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { find, merge } from 'lodash';
import LiquorTree from 'liquor-tree';
import { VTree, VSelectTree } from 'vue-tree-halower'
import 'vue-tree-halower/dist/halower-tree.min.css';

@Component({
    components: {
        'v-select-tree': VSelectTree,
        'v-tree': VTree
    },
})
export default class TreeBlock extends Vue {
    private mounted() {
        window.eventBus.$on('page-changed', (data) => {
            try {
                const page = JSON.parse(atob(data.page.json_buffer));
                this.$store.dispatch('builder/updateSelectedNode', {
                    id: page.children[0] && page.children[0].id,
                    data: page.children[0],
                });
            } catch(error) {
                console.error('component selection failed!');
            }
        });
    }

    private onNodeSelected(node) {
        const { id, data } = node;
        this.$store.dispatch('builder/updateSelectedNode', {
            id,
            data: node.data.data,
        });
    }

    private constructBodyNode(data) {
        let node: any = [];
        let children = data.children;
        if (Array.isArray(children)) {
            children.forEach(item => {
                let leaf: any = {
                    title: item.title || item.name || item.element,
                    data: {
                        id: item.id || null, // TODO fetch id
                        data: item,
                    },
                    expanded: true,
                };
                if (item.children) {
                    leaf.children = this.constructBodyNode({
                        children: item.children,
                    });
                }
                node.push(leaf);
            });
        }
        return node;
    }

    get treeData() {
        let pageTree = this.$store.state.builder.pageTree || [];
        const sourceCode = this.$store.state.builder.sourceCode || {};
        const currentView = this.$store.state.builder.currentView || {};
        if (currentView.json_buffer) {
            const jsonTree = JSON.parse(atob(currentView.json_buffer));
            pageTree = this.constructBodyNode(jsonTree);
        }
        let root = [
            {
                title: 'Component',
                expanded: true,
                children: pageTree,
                selDisabled: true
            },
        ];

        return root;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.component-tree-block-wrapper {
    background: #ffffff;
}
</style>