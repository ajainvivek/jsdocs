<template>
  <div class="uikits-block-wrapper">
    <i-input search placeholder="Search UI kit..."/>
    <div class="card-list-wrapper">
      <Card class="card" v-for="uikit in uikits" :key="uikit.id">
        <div @click="loadUiKit(uikit)">
          <img :src="uikit.icon" height="32">
          <h3>{{uikit.title}}</h3>
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

    get uikits() {
        const uikits = this.dataType === 'uikit' ? this.$store.state.builder.uikits : [];
        return uikits;
    }

    private beforeMount() {
        this.bootstrap();
    }

    private async bootstrap() {
        const uikits = await this.fetchUiKits();
        const sourceCode = await this.fetchTemplateSourceCode();
        if (uikits && sourceCode) {
            this.$store.dispatch('builder/updateUiKits', uikits);
            this.$store.dispatch('builder/updateSourceCode', sourceCode);
        }
    }

    private isDependencyIncluded() {
        const { parsed } = this.getNpmDependencies();
        const uikit = this.$store.state.builder.activeUiKit;
        if (uikit && uikit.name) {
            return !!parsed['dependencies'][uikit.name];
        }
        return false;
    }

    private async loadUiKit(dependency) {
        const sourceCode = this.$store.state.builder.sourceCode;
        const activeUiKit = this.$store.state.builder.activeUiKit;
        if (sourceCode.template === dependency.template) {
            if (!this.isDependencyIncluded()) {
                const isDependencyAdded = await this.addNpmDependencyToPackage(dependency);
                if (isDependencyAdded) {
                    this.navigateToStudio();
                }
            } else {
                this.navigateToStudio();
            }
        }
    }

    private navigateToStudio() {
        this.$router.push('/studio');
    }

    private sortObjectByKeys(object) {
        const sorted: any = sortBy(toPairs(object), 0);
        return fromPairs(sorted);
    }

    private allComponentsPromise(components) {
        const promises: any = [];
        components.forEach(component => {
            promises.push(
                new Promise<object>((resolve, reject) => {
                    fetch(`${process.env.VUE_APP_ASSETS_BASE_URL}/uikit/element-ui/${component}.json`)
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

    private async fetchTemplateSourceCode() {
        const sourceCode = await fetch(`${process.env.VUE_APP_ASSETS_BASE_URL}/templates/vue-router.json`)
            .then(response => response.json())
            .then(data => {
                return data;
            });
        if (sourceCode) {
            return Promise.resolve(sourceCode);
        }

        return Promise.reject(null);
    }

    private async fetchUiKits() {
        const uikits = await fetch(`${process.env.VUE_APP_ASSETS_BASE_URL}/uikit/index.json`)
            .then(response => response.json())
            .then(data => {
                return data;
            });
        if (uikits.data && uikits.data.uikit) {
            return Promise.resolve(uikits.data.uikit);
        }

        return Promise.reject(null);
    }

    private async fetchUiKit(id) {
        if (id) {
            const uikit = await fetch(`${process.env.VUE_APP_ASSETS_BASE_URL}/uikit/element-ui/index.json`)
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

        const code: string = JSON.stringify(parsed, null, 2);
        const uikit: any = await this.fetchUiKit(id);
        const components = (uikit.data && uikit.data.components) || [];
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
        const uikit: any = await this.fetchUiKit(id);

        delete parsed.dependencies[name];
        parsed.dependencies = this.sortObjectByKeys(parsed.dependencies);

        const code: string = JSON.stringify(parsed, null, 2);

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