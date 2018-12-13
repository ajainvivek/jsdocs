<template>
	<div class="right-side-panel-block-wrapper">
		<Tabs>
			<TabPane label="Properties" class="content">
				<PropertiesBlock></PropertiesBlock>
			</TabPane>
			<TabPane label="Connect" class="content">
				<Connect></Connect>
			</TabPane>
		</Tabs>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Connect from './Connect.vue';
import PropertiesBlock from './PropertiesBlock.vue';

@Component({
    components: {
        Connect,
        PropertiesBlock,
    },
})
export default class RightSidePanel extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.right-side-panel-block-wrapper {
    padding: 0 4px;
}

.content {
    padding: 0 10px;
}
</style>