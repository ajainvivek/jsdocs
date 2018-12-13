<template>
	<div class="input-text-container" v-if="!isVisible">
		<FormItem :label="title">
			<Input :value="value" :placeholder="placeholder" @on-change="onChange" />
		</FormItem>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isEmpty } from 'lodash';

@Component({
    props: ['data'],
})
export default class InputText extends Vue {
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
    private onChange(input) {
        // if target exists
        if (input.target) {
            const properties = {};
            properties[this.data.propertyType] = input.target.value;

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
</style>