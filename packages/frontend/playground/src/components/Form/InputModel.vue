<template>
	<div class="input-model-container">
		<Card :bordered="false">
			<p slot="title">
				{{title}}
				<Poptip class="tooltip" trigger="hover" :content="info" word-wrap width="200" placement="left-end">
					<Icon type="ios-information-circle-outline" />
				</Poptip>
			</p>
			<div>
				<Row>
					<Col span="18">
					<Input :value="value" :placeholder="placeholder" @on-blur="onBlur" />
					</Col>
					<Col span="6">
					<Button size="large" class="data-btn" icon="ios-link" type="info" shape="circle" @click="openJSONEditor" ghost></Button>
					</Col>
				</Row>
			</div>
		</Card>
		<Modal v-model="isJSONEditor" fullscreen>
			<p slot="header">
				<span>{{title}}</span>
			</p>
			<div>
				<JSONEditor :data="editorValue" ref="jsoneditor" :onChange="onJSONUpdate"></JSONEditor>
			</div>
			<div slot="footer">
				<Button icon="md-clipboard" class="save-btn" size="large" @click="onJSONSave">Save</Button>
			</div>
		</Modal>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isEmpty, camelCase } from 'lodash';
import JSONEditor from '@/components/JSONEditor';

@Component({
    props: ['data'],
    components: {
        JSONEditor,
    },
})
export default class InputModel extends Vue {
    private isJSONEditor: boolean = false;
    private value: string = this.data.value || this.data.default;
    private jsonData: object = this.data.model || {};

    get info() {
        return this.data ? this.data.info : '';
    }
    get title() {
        return this.data ? this.data.title : '';
    }
    get placeholder() {
        return this.data ? this.data.placeholder : '';
    }
    get isVisible() {
        return isEmpty(this.data);
    }
    get editorValue() {
        return Object.assign({}, this.jsonData[this.dataKey] || {});
    }
    get dataKey() {
        return `data_${this.data.id}`;
    }

    created() {
        this.value = this.value.replace(`${this.dataKey}.`, '');
    }

    private onJSONUpdate(value) {
        try {
            this.jsonData[this.dataKey] = JSON.parse(value);
        } catch (error) {
            console.error('JSON update failed!');
        }
    }
    private openJSONEditor() {
        if (isEmpty(this.value)) {
            this.$Message.info('Please enter model name');
            return;
        }
        this.isJSONEditor = true;
        let jsoneditor: any = this.$refs.jsoneditor;
        jsoneditor.refresh();
    }
    private updateComponent() {
        const properties = {};
        properties[this.data.propertyType] = `${this.dataKey}.${this.value}`;
        const currentView = this.$store.state.builder.currentView;
        const data = this.jsonData;

        this.$store.dispatch('builder/updateComponentData', {
            id: this.data.id,
            properties,
            data: this.jsonData,
            currentView,
        });
    }
    private onJSONSave() {
        // TODO: validate the json schema then save
        this.isJSONEditor = false;
        this.updateComponent();
    }
    private onBlur(input) {
        // if target exists
        if (input.target) {
            let value = camelCase(input.target.value);
            const prevKey = this.value;
            const newKey = value;
            this.value = value;

            if (value) {
                if (isEmpty(this.jsonData)) {
                    this.jsonData[this.dataKey] = {
                        [this.value]: '',
                    };
                } else {
                    this.jsonData[this.dataKey] = {
                        [newKey]: this.jsonData[this.dataKey][prevKey] || '',
                    };
                }

                this.updateComponent();
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.input-model-container {
    width: 100%;
    margin-bottom: 20px;
    .tooltip {
        float: right;
        cursor: pointer;
    }

    .ivu-poptip-body-content-inner {
        font-weight: 400;
    }

    .data-btn {
        margin: 0 auto;
        display: table;
        width: 30px !important;
        height: 30px !important;
    }
}
</style>