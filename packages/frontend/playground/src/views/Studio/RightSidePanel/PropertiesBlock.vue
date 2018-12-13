<template>
	<div class="properties-block-wrapper">
		<Form label-position="top">
			<div v-for="input in formComponents" :key="input.index">
				<component :is="input.component" :data="input.data"></component>
			</div>
		</Form>
		<div class="delete">
			<Poptip confirm title="Are you sure you want to delete this item?" @on-ok="deleteComponent" ok-text="Yes" cancel-text="No">
				<Button type="primary" long>DELETE</Button>
			</Poptip>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Form from '@/components/Form';
import { startCase, pickBy, get } from 'lodash';

@Component
export default class PropertiesBlock extends Vue {
    private selectComponents(properties, selectedComponent) {
        const keys = Object.keys(properties);
        const components = [];
        keys.forEach((key, index) => {
            const type = properties[key].type;
            const values = properties[key].values;

            let formComponent = '';
            let props = {};
            if (type === 'string' && Array.isArray(values)) {
                formComponent = Form.Select;
                props['options'] = values.map(value => {
                    return {
                        value,
                        label: startCase(value),
                    };
                });
            }
            const appliedProperties = selectedComponent.appliedProperties || {};
            const selected = appliedProperties[key];
            const input = {
                id: selectedComponent.uuid || index,
                component: formComponent,
                data: Object.assign(
                    {
                        title: properties[key].title || '',
                        placeholder: properties[key].placeholder || '',
                        default: properties[key].default || '',
                        id: selectedComponent.uuid || index,
                        properties,
                        propertyType: key,
                    },
                    props,
                ),
            };
            if (selected) {
                input.data.selected = selected;
            }
            if (formComponent) {
                components.push(input);
            }
        });
        return components;
    }

    private selectActionComponents(properties, selectedComponent) {
        const keys = Object.keys(properties);
        let options = [];

        keys.forEach((key, index) => {
            let formComponent = '';
            let option: any = {
                title: properties[key].title || '',
                placeholder: properties[key].placeholder || '',
                id: selectedComponent.uuid || index,
                propertyType: key,
                action: selectedComponent.uuid || {},
            };
            const appliedProperties = selectedComponent.appliedProperties || {};
            const selected = appliedProperties[key];

            option.selected = selected || properties[key].default || false;

            options.push(option);
        });

        return [
            {
                id: 'selectAction',
                component: Form.SelectActions,
                data: {
                    id: selectedComponent.uuid,
                    options,
                    properties,
                },
            },
        ];
    }

    private inputComponents(properties, selectedComponent, inputType) {
        const keys = Object.keys(properties);
        const components = [];
        keys.forEach((key, index) => {
            const type = properties[key].type;
            const values = properties[key].values;

            let formComponent = Form[inputType];
            let props = {};
            const appliedProperties = selectedComponent.appliedProperties || {};
            const selected = appliedProperties[key];
            const input: any = {
                id: selectedComponent.uuid || index,
                component: formComponent,
                data: Object.assign(
                    {
                        title: properties[key].title || '',
                        placeholder: properties[key].placeholder || '',
                        default: properties[key].default || '',
                        id: selectedComponent.uuid || index,
                        properties,
                        propertyType: key,
                        info: properties[key].info || '',
                    },
                    props,
                ),
            };
            if (selected) {
                input.data.value = selected;
                // if it has model
                if (inputType === 'InputModel') {
                    if (selectedComponent['data']) {
                        let data = Object.assign({}, selectedComponent['data']);
                        input.data.model = data;
                    }
                }
            }
            if (formComponent) {
                components.push(input);
            }
        });
        return components;
    }

    private checkboxGroupComp(properties, selectedComponent) {
        const keys = Object.keys(properties);
        let options = [];

        keys.forEach((key, index) => {
            let formComponent = '';
            let option: any = {
                title: properties[key].title || '',
                placeholder: properties[key].placeholder || '',
                id: selectedComponent.uuid || index,
                propertyType: key,
            };
            const appliedProperties = selectedComponent.appliedProperties || {};
            const selected = appliedProperties[key];

            option.selected = selected || properties[key].default || false;

            options.push(option);
        });

        return [
            {
                id: 'checkboxGroup',
                component: Form.CheckboxGroup,
                data: {
                    id: selectedComponent.uuid,
                    options,
                    properties,
                },
            },
        ];
    }
    private dropDownComponent(selectedComponent) {
        if (selectedComponent.children) {
            let formComponent = Form.DropDown;
            const input = {
                id: selectedComponent.uuid,
                component: formComponent,
                data: selectedComponent.children,
            };
            return [input];
        }
        return [];
    }

    private deleteComponent() {
        this.$Message.info('Component deleted!');
    }

    get formComponents() {
        const selectedComponent = this.$store.getters['builder/selectedComponent'];
        const selectProperties = pickBy(selectedComponent.properties || {}, prop => {
            return Array.isArray(prop.values);
        });
        const inputTextProperties = pickBy(selectedComponent.properties || {}, prop => {
            return prop.type === 'string' && typeof prop.value === 'string' && !prop.isModel && !prop.isAction;
        });
        const inputNumberProperties = pickBy(selectedComponent.properties || {}, prop => {
            return prop.type === 'number';
        });
        const checkboxGroupProperties = pickBy(selectedComponent.properties || {}, prop => {
            return prop.type === 'boolean';
        });
        const inputModelProperty = pickBy(selectedComponent.properties || {}, prop => {
            return prop.isModel;
        });
        const selectActionsProperties = pickBy(selectedComponent.properties || {}, prop => {
            return prop.isAction;
        });
        const dropDownComponent = this.dropDownComponent(selectedComponent);
        const checkboxGroupComp = this.checkboxGroupComp(checkboxGroupProperties, selectedComponent);
        const selectComponents = this.selectComponents(selectProperties, selectedComponent);
        const inpuTextComponents = this.inputComponents(inputTextProperties, selectedComponent, 'InputText');
        const inpuNumberComponents = this.inputComponents(inputNumberProperties, selectedComponent, 'InputDigit');
        const inputModelComponent = this.inputComponents(inputModelProperty, selectedComponent, 'InputModel');
        const selectActionComponent = this.selectActionComponents(selectActionsProperties, selectedComponent);

        const components: any = selectComponents.concat(
            inpuTextComponents,
            inpuNumberComponents,
            checkboxGroupComp,
            dropDownComponent,
            inputModelComponent,
            selectActionComponent,
        );

        return components;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.properties-block-wrapper {
    height: 100%;
    width: 100%;

    .delete {
        position: relative;
        bottom: 0;

        .ivu-poptip {
            width: 100%;
        }
    }
}
</style>

<style lang="scss">
.ivu-tabs {
    overflow: visible !important;
}

.delete {
    .ivu-poptip-rel {
        width: 100%;
    }
}
</style>