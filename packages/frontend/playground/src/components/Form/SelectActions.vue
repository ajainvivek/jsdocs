<template>
	<div class="select-actions-container" v-if="!isVisible">
		<div>
			<Card :bordered="false">
				<p slot="title">
					Actions
					<Poptip class="tooltip" trigger="hover" :content="info" word-wrap width="200" placement="left-end">
						<Icon type="ios-information-circle-outline" />
					</Poptip>
				</p>
				<Row>
					<Col span="24">
					<Dropdown>
						<Button long>
							Add Action
							<Icon type="ios-arrow-down"></Icon>
						</Button>
						<DropdownMenu slot="list">
							<div v-for="action in unselectedActions" :key="action.id" @click="onSelectionClick(child)">
								<DropdownItem>{{action.title}}</DropdownItem>
							</div>
						</DropdownMenu>
					</Dropdown>
					</Col>
				</Row>
				<Divider dashed />
				<Row v-for="action in selectedActions" :key="action.id">
					<Col span="16">
					<Button long type="dashed">{{action.value}}</Button>
					</Col>
					<Col span="4">
					<Poptip class="tooltip" trigger="hover" content="Link the action">
						<Button size="large" class="data-btn" icon="ios-link" type="info" shape="circle" ghost></Button>
					</Poptip>
					</Col>
					<Col span="4">
					<Poptip class="tooltip" trigger="hover" content="Remove the action" placement="left-end">
						<Button size="large" class="data-btn" icon="ios-trash-outline" type="primary" shape="circle" ghost></Button>
					</Poptip>
					</Col>
				</Row>
			</Card>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isEmpty, merge, find } from 'lodash';
import { recursiveComponentInject, injectFakeData, uniqueStringId } from '@/helpers';

@Component({
    props: ['data'],
})
export default class SelectActions extends Vue {
    private selectedActions = [];
    private unselectedActions = [];

    get info() {
        return 'Methods to be mixed into the instance. You can access these methods directly on the VM instance, or use them in directive expressions.';
    }

    get isVisible() {
        return isEmpty(this.data);
    }

    created() {
        this.unselectedActions = [
            {
                id: 1,
                title: 'tab-click',
            },
        ];

        this.selectedActions = [
            {
                id: 2,
                value: 'tab-click',
            },
        ];
    }

    private onSelectionClick() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.select-actions-container {
    width: 100%;
    margin-bottom: 20px;

    .data-btn {
        margin: 0 auto;
        display: table;
        width: 30px !important;
        height: 30px !important;
    }

    .tooltip {
        float: right;
        cursor: pointer;
    }

    .ivu-poptip-body-content-inner {
        font-weight: 400;
    }

    .ivu-dropdown {
        width: 100%;
    }
}
</style>