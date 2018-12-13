<template>
	<div class="input-number-container" v-if="!isVisible">
		<FormItem :label="title">
			<InputNumber :value="value" :placeholder="placeholder" @on-change="onChange"></InputNumber>
		</FormItem>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isEmpty } from 'lodash';

@Component({
    props: ['data'],
})
export default class InputDigit extends Vue {
    get title() {
        return this.data ? this.data.title : '';
    }
    get placeholder() {
        return this.data ? this.data.placeholder : '';
    }
    get isVisible() {
        return isEmpty(this.data);
    }
    get value() {
        return this.data.value || this.data.default;
    }
    private onChange(value) {
        // if target exists
        if (typeof value === 'number') {
            const properties = {};
            properties[this.data.propertyType] = value;

            const currentView = this.$store.state.builder.currentView;

            this.$store.dispatch('builder/updateComponentData', {
                id: this.data.id,
                properties,
                currentView,
            });
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.input-number-container {
    .ivu-input-number {
        width: 100%;
    }
}
</style>