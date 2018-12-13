<template>
	<div class="component-tree-block-wrapper">
		<tree ref="pageTree" :data="treeData" :options="treeOptions" @node:selected="onNodeSelected" @node:dragging:start="logDragStart" @node:dragging:finish="logDragFinish" />
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { find, merge } from 'lodash';
import LiquorTree from 'liquor-tree';

@Component({
    components: {
        [LiquorTree.name]: LiquorTree,
    },
})
export default class TreeBlock extends Vue {
    private buttonProps = {
        type: 'default',
        size: 'small',
    };

    private treeOptions = {
        propertyNames: {
            text: 'title',
            children: 'children',
            data: 'data',
            state: 'options',
        },
        dnd: true,
        checkbox: false,
    };

    private mounted() {
        const selectedNode = this.$store.state.builder.selectedNode;
        const treeRef: any = this.$refs.pageTree;
        if (selectedNode && selectedNode.data) {
            // TODO: the treeData is empty on load
            let node = treeRef.find({
                id: selectedNode.data.id,
            });
            if (node) {
                node.selected();
            }
        }
    }

    @Watch('treeData')
    onTreeDataChange(treeData) {
        const treeRef: any = this.$refs.pageTree;
        if (treeRef && treeRef.tree) {
            let model = treeRef.tree.parse(treeData);
            this.$set(treeRef, 'model', model);
        }
    }

    private onNodeSelected(node) {
        const { id, data } = node;
        this.$store.dispatch('builder/updateSelectedNode', {
            id,
            data,
        });
    }

    private logDragStart(node) {
        console.log('Start dragging: ' + node.text);
    }

    private logDragFinish(targetNode, distinationNode) {
        console.log(`Stop dragging: [TARGET]${targetNode.text}`);
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
        pageTree = pageTree.map(node => {
            if ((node.id === 'header' || node.id === 'footer') && sourceCode.shared[node.id]) {
                const headerId = sourceCode.shared.header;
                const headerModule: any = find(sourceCode.modules, {
                    shortid: headerId,
                });
                node.children = [];
                node.children.push({
                    title: headerModule.name,
                    data: {
                        id: headerId,
                    },
                });
            }
            if (node.id === 'body' && currentView.json_buffer) {
                const jsonTree = JSON.parse(atob(currentView.json_buffer));
                node.children = this.constructBodyNode(jsonTree);
            }
            return node;
        });
        let root = [
            {
                title: currentView.name || 'Page',
                options: { expand: true, draggable: false, dropable: false, expanded: true },
                children: pageTree,
            },
        ];

        return root;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.ivu-tree li ul {
    line-height: 24px;
}
</style>