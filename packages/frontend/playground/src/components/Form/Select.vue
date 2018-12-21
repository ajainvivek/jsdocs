<template>
	<div class="drop-down-container" v-if="!isVisible">
		<FormItem :label="title">
			<Select :placeholder="placeholder" :value="selected" @on-open-change="onDropDownVisible" @on-change="onOptionChange" :clearable="isClearable" @on-clear="onClear">
				<Option v-for="option in options" :value="option.value" :key="option.value">{{ option.label }}</Option>
			</Select>
		</FormItem>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isEmpty } from 'lodash';

@Component({
    props: ['data'],
})
export default class DropDown extends Vue {
    private data: any = this.data;
    private isDropDownVisible = false;
    get isClearable() {
        return !this.data.default;
    }
    get title() {
        return this.data ? this.data.title : '';
    }
    get options() {
        return this.data ? this.data.options : '';
    }
    get placeholder() {
        return this.data ? this.data.placeholder : '';
    }
    get isVisible() {
        return isEmpty(this.data);
    }
    get selected() {
        return this.data.selected || this.data.default;
    }
    private onOptionChange(selected) {
        // if dropdown is visible then trigger option change
        if (this.isDropDownVisible) {
            const properties = {};
            properties[this.data.propertyType] = selected;

            const currentView = this.$store.state.builder.currentView;

            this.$store.dispatch('builder/updateComponentData', {
                id: this.data.id,
                properties,
                currentView,
            });
        }
    }
    private onClear() {
        const properties = {};
        properties[this.data.propertyType] = null;

        const currentView = this.$store.state.builder.currentView;

        this.$store.dispatch('builder/updateComponentData', {
            id: this.data.id,
            properties,
            currentView,
        });
    }
    private onDropDownVisible(visible) {
        this.isDropDownVisible = visible;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>