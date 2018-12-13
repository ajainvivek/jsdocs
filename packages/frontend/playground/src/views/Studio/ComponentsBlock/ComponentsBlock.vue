<template>
	<div class="component-search-block-wrapper">
		<Input search placeholder="Search..." />
		<div class="item-wrapper" v-for="category in categories" :key="category.id">
			<h4>{{category.name}}</h4>
			<div class="items">
				<div v-for="component in getCategoryItems(category.id)" :key="component.id" @click="injectComponent(component)">
					<Card class="card" shadow>
						<div class="title">
							<Icon :type="component.icon" class="icon" size="16" />
							<h4 class="text">{{component.title}}</h4>
							<span>({{component.uikit}})</span>
						</div>
						<p class="desc">{{component.info}}</p>
					</Card>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { filter, uniqBy, upperFirst, merge } from 'lodash';
import { uniqueStringId } from '@/helpers';

@Component
export default class ComponentsBlock extends Vue {
    get components() {
        const components = this.$store.state.builder.components;
        return components.filter(component => {
            return component.visible === true;
        });
    }
    private getCategoryItems(category) {
        const components = this.components;
        return filter(components, {
            category,
        });
    }

    get categories() {
        const components = this.components;

        const categories = uniqBy(components, 'category').map(item => {
            let component: any = item;
            return {
                id: component.category,
                name: upperFirst(component.category),
            };
        });
        return categories;
    }

    private injectComponent(component) {
        const currentView = this.$store.state.builder.currentView;
        const { id, directory_shortid } = currentView;
        const json: any = JSON.parse(atob(currentView.json_buffer));
        const sid = uniqueStringId();
        const defaultValue = Object.assign({}, component.default);
        component = merge(
            {
                id: sid,
                name: component.name,
                node: 'container',
                element: component.element,
                uikit: component.uikit,
                native: component.native,
            },
            {
                properties: {
                    [`data-${sid}`]: true,
                    class: [sid],
                },
            },
            defaultValue,
        );
        json.children.push(component);
        this.$store.dispatch('builder/updateModuleCode', { id, directory_shortid, jsonView: json });
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.component-search-block-wrapper {
    padding: 5px 0;
}

.item-wrapper {
    padding: 10px 0;

    h4 {
        padding: 0 5px;
        color: #929292;
        font-weight: 500;
    }
}

.card {
    margin: 8px 0;
    cursor: pointer;

    h4 {
        font-weight: 600;
    }

    .title {
        display: inline-block;
        width: 100%;
        height: 20px;

        .icon {
            float: left;
            line-height: 22px;
        }

        .text {
            float: left;
            padding: 0 10px;
        }

        span {
            float: right;
            font-size: 10px;
            text-transform: capitalize;
            color: #8a909d;
            font-weight: 500;
        }
    }

    .desc {
        font-size: 12px;
        color: #979797;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-left: 26px;
    }
}
</style>
