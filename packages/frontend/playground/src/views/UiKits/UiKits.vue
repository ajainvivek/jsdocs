<template>
	<div class="uikits-block-wrapper">
		<i-input search placeholder="Search UI kit..." />
			<div class="card-list-wrapper">
				<Card class="card" v-for="dependency in dependencies" :key="dependency.id">
					<div @click="loadUiKit(dependency)">
						<img :src="dependency.icon" height="32">
						<h3>{{dependency.title}}</h3>
					</div>
				</Card>
			</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { find, fromPairs, toPairs, sortBy } from 'lodash';

@Component
export default class UiKits extends Vue {
    private showModal: boolean = false;
    private dataType: string = 'uikit'; // uikit, plugins, csskit

    get dependencies() {
        const { parsed } = this.getNpmDependencies();
        const dependencies = this.dataType === 'uikit' ? this.$store.state.builder.uikit : [];
        if (parsed['dependencies']) {
            dependencies.map(dependency => {
                dependency.included = false;
                if (parsed['dependencies'][dependency.name]) {
                    dependency.included = true;
                }
                return dependency;
            });
        }
        return dependencies;
    }

    private async loadUiKit(dependency) {
        const sourceCode = this.$store.state.builder.sourceCode;
        if (sourceCode.template === dependency.template) {
            let isDependencyAdded = await this.addNpmDependencyToPackage(dependency);
            if (isDependencyAdded) {
                this.navigateToStudio();
            }
        }
    }

    private navigateToStudio() {
        this.$router.push('/studio');
    }

    private sortObjectByKeys(object) {
        let sorted: any = sortBy(toPairs(object), 0);
        return fromPairs(sorted);
    }

    private allComponentsPromise(components) {
        const promises = [];
        components.forEach(component => {
            promises.push(
                new Promise((resolve, reject) => {
                    fetch(`/data/dependencies/uikit/element-ui/${component}.json`)
                        .then(response => response.json())
                        .then(data => {
                            return resolve(data);
                        })
                        .catch(error => {
                            return reject(error);
                        });
                }),
            );
        });
        return promises;
    }

    private async fetchUiKit(id) {
        if (id) {
            let uikit = await fetch('/data/dependencies/uikit/element-ui/index.json')
                .then(response => response.json())
                .then(data => {
                    return data;
                });
            if (uikit.data && uikit.data.components) {
                const allComponentsPromise = this.allComponentsPromise(uikit.data.components);
                const components = await Promise.all(allComponentsPromise);
                uikit.data.components = components;
                return Promise.resolve(uikit);
            }

            return Promise.reject(false);
        }
    }

    private getNpmDependencies() {
        const sourceCode = this.$store.state.builder.sourceCode;
        const module: any = find(sourceCode.modules, {
            title: 'package.json',
        });
        const parsed = JSON.parse(module.code);
        return {
            parsed,
            module,
        };
    }

    private async addNpmDependencyToPackage(dependency) {
        const { id, name, version, isDev, included } = dependency;
        // if package is already included
        if (included) {
            return Promise.resolve(true);
        }
        const { parsed, module } = this.getNpmDependencies();
        const type = isDev ? 'devDependencies' : 'dependencies';

        parsed[type] = parsed[type] || {};
        parsed[type][name] = version || 'latest';
        parsed[type] = this.sortObjectByKeys(parsed[type]);

        let code = JSON.stringify(parsed, null, 2);
        let uikit: any = await this.fetchUiKit(id);
        let components = (uikit.data && uikit.data.components) || [];
        this.$store.dispatch('builder/addComponents', components);
        this.$store.dispatch('builder/updateModuleCode', {
            id: module.id,
            directory_shortid: module.directory_shortid,
            code,
            plugin: uikit.data.import,
        });

        this.$Notice.info({
            title: 'Package Dependency',
            desc: `Adding ${name} dependency to project`,
        });

        return Promise.resolve(true);
    }

    private async removeNpmDependencyFromPackage(dependency) {
        const { id, name, version, isDev, included } = dependency;
        const { parsed, module } = this.getNpmDependencies();
        let uikit: any = await this.fetchUiKit(id);

        delete parsed.dependencies[name];
        parsed.dependencies = this.sortObjectByKeys(parsed.dependencies);

        let code = JSON.stringify(parsed, null, 2);

        this.$store.dispatch('builder/removeComponents', {
            uikit: id,
        });
        this.$store.dispatch('builder/updateModuleCode', {
            id: module.id,
            directory_shortid: module.directory_shortid,
            code,
            isRemoveDependency: true,
            plugin: uikit.data.import,
        });
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.uikits-block-wrapper {
    padding: 10px;

    .card {
        margin: 8px 0;
        width: 200px;
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
}
</style>