<template>
	<div class="switch-container" v-if="!isVisible">
		<FormItem>
			<CheckboxGroup v-model="selected" @on-change="onOptionChange">
				<Checkbox v-for="option in options" :key="options.id" :label="option.title"></Checkbox>
			</CheckboxGroup>
		</FormItem>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isEmpty, camelCase } from 'lodash';

@Component({
    props: ['data'],
})
export default class DropDown extends Vue {
    private selected = [];
    get options() {
        return this.data ? this.data.options : [];
    }
    get isVisible() {
        return isEmpty(this.data);
    }
    private beforeMount() {
        this.selected = this.options.reduce((result, option) => {
            if (option.selected) {
                result.push(option.title);
            }
            return result;
        }, []);
    }
    private onOptionChange() {
        const properties = {};
        this.options.forEach(option => {
            properties[camelCase(option.title)] = false;
        });
        this.selected.forEach(item => {
            properties[camelCase(item)] = true;
        });
        const currentView = this.$store.state.builder.currentView;
        this.$store.dispatch('builder/updateComponentData', {
            id: this.data.id,
            properties,
            currentView,
        });
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>