<template>
	<div class="home">
		<Split v-model="split1">
			<div slot="left" class="pu-split-pane padding-10">
				<LeftSidePanel></LeftSidePanel>
			</div>
			<div slot="right" class="pu-split-pane">
				<Split v-model="split2">
					<div slot="left" class="pu-split-pane padding-10">
						<Split v-model="split4" mode="vertical">
							<div slot="top" class="pu-split-pane">
								<TreeBlock></TreeBlock>
							</div>
							<div slot="bottom" class="pu-split-pane padding-10">
								<ComponentsBlock></ComponentsBlock>
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
		</Split>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LeftSidePanel from './../LeftSidePanel';
import TreeBlock from './../TreeBlock';
import ComponentsBlock from './../ComponentsBlock';
import PreviewBlock from './../PreviewBlock';
import RightSidePanel from './../RightSidePanel';

@Component({
    components: {
        LeftSidePanel,
        TreeBlock,
        ComponentsBlock,
        PreviewBlock,
        RightSidePanel,
    },
})
export default class Home extends Vue {
    private split1 = 0.12;
    private split2 = 0.2;
    private split3 = 0.75;
    private split4 = 0.4;
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
