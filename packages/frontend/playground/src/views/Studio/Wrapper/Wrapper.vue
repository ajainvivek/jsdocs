<template>
	<div class="home">
		<Split v-model="split1">
			<div slot="left" class="pu-split-pane padding-10">
				<Split v-model="split2" mode="vertical">
					<div slot="top" class="pu-split-pane">
						<PageBlock></PageBlock>
					</div>
					<div slot="bottom" class="tree-block pu-split-pane padding-10">
						<TreeBlock></TreeBlock>
					</div>
				</Split>
			</div>
			<div slot="right" class="pu-split-pane">
				<Split v-model="split3">
						<div slot="left" class="pu-split-pane preview">
							<PreviewBlock></PreviewBlock>
						</div>
						<div slot="right" class="pu-split-pane">
							<RightSidePanel></RightSidePanel>
						</div>
					</Split>
			</div>
		</Split>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PageBlock from './../PageBlock';
import TreeBlock from './../TreeBlock';
import PreviewBlock from './../PreviewBlock';
import RightSidePanel from './../RightSidePanel';

@Component({
    components: {
        PageBlock,
        TreeBlock,
        PreviewBlock,
        RightSidePanel,
    },
})
export default class Home extends Vue {
    private split1 = 0.2;
    private split2 = 0.7;
    private split3 = 0.75;
}
</script>

<style scoped>
.home {
    height: 100%;
    position: relative;
    background: #f5f5f5;
    border: 1px solid #dcdee2;
    overflow: hidden;
}

.tree-block {
	background: #fff;
}

.pu-split-pane {
    height: 100%;
    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;
    overflow-y: scroll;
}

.pu-split-pane::-webkit-scrollbar {
    display: none;
}

.padding-10 {
    padding: 10px;
}

.preview {
    background: #fff;
}
</style>
