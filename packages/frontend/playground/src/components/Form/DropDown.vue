<template>
  <div class="drop-down-container" v-if="!isVisible">
    <Dropdown>
      <Button long>Add Child
        <Icon type="ios-arrow-down"></Icon>
      </Button>
      <DropdownMenu slot="list">
        <div v-for="child in childrens" :key="child.id" @click="onClick(child)">
          <DropdownItem>{{child.title}}</DropdownItem>
        </div>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isEmpty, merge, find } from 'lodash';
import { recursiveComponentInject, injectFakeData, uniqueStringId } from '@/helpers';

@Component({
    props: ['data'],
})
export default class DropDown extends Vue {
    private isDropDownVisible: boolean = false;
    private data: any = this.data;
    get isVisible() {
        return isEmpty(this.data);
    }
    get childrens() {
        return this.data || [];
    }
    private onClick(data) {
        const components = this.$store.state.builder.components;
        const component = find(components, {
            id: data.id,
        });
        this.injectChildComponent(component);
    }
    private injectChildComponent(component) {
        const selectedComponent = this.$store.getters['builder/selectedComponent'];
        const currentView = this.$store.state.builder.currentView;
        const sid = uniqueStringId();
        const defaultValue = Object.assign({}, component.default);
        const { id, directory_shortid } = currentView;
        const json: any = JSON.parse(atob(currentView.json_buffer));
        component = merge(
            {
                id: sid,
                name: component.name,
                node: 'container',
                element: component.element,
                uikit: component.uikit,
                native: component.native,
                inlineStyle: component.inlineStyle,
            },
            {
                properties: {
                    [`data-${sid}`]: true,
                    class: [sid],
                },
            },
            defaultValue,
        );

        component = injectFakeData(component);

        // Find the components from the list || nested children
        json.children = recursiveComponentInject(
            json.children,
            {
                id: selectedComponent.uuid,
            },
            component,
        );

        this.$store.dispatch('builder/updateModuleCode', { id, directory_shortid, jsonView: json });
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.drop-down-container {
    width: 100%;
    margin-bottom: 20px;

    .ivu-dropdown {
        width: 100%;
    }
}
</style>