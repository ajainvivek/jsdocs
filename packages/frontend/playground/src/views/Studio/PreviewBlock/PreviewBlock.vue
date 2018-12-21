<template>
  <div class="page-preview-block-wrapper">
    <div class="header">
      <Affix :offset-top="60">
        <Tooltip content="Preview Source Code" theme="light" class="float-right">
          <Button class="space" @click="openCodePreview">
            <Icon type="md-code" size="20"/>
          </Button>
        </Tooltip>
        <Tooltip content="Fullscreen Preview" theme="light" class="float-right">
          <Button class="space" @click="togglePreviewView">
            <Icon type="md-resize" size="20"/>
          </Button>
        </Tooltip>
      </Affix>
    </div>
    <div class="main">
      <Frame ref="preview"/>
    </div>
    <Modal v-model="isCodePreview" fullscreen>
      <p slot="header">
        <span>{{currentView && currentView.title}}</span>
      </p>
      <div>
        <CodePreview :code="currentView.code" ref="codepreview"></CodePreview>
      </div>
      <div slot="footer">
        <Button
          icon="md-clipboard"
          class="preview-btn"
          size="large"
          @click="copyToClipboard"
        >Copy File</Button>
        <Button
          icon="md-code-download"
          class="preview-btn"
          type="primary"
          size="large"
          @click="downloadFile"
        >Download File</Button>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import jsontoui from 'jsontoui';
import { find } from 'lodash';
import Frame from './Frame.vue';
import CodePreview from '@/components/CodePreview';

@Component({
    components: {
        Frame,
        CodePreview,
    },
})
export default class PreviewBlock extends Vue {
    private isCodePreview = false;

    get currentView() {
        return this.$store.state.builder.currentView || {};
    }

    private openCodePreview() {
        this.isCodePreview = true;
        const codepreview: any = this.$refs.codepreview;
        codepreview.refresh();
    }

    private updateSelectedPage(page) {
        const sourceCode = this.$store.state.builder.sourceCode;
        const isHashRoute = sourceCode.isHashRoute;
        const frame = document.getElementById('sandbox') as HTMLIFrameElement;
        frame.contentWindow!.postMessage(
            { type: 'route-change', isHash: isHashRoute, codesandbox: true, path: page.path },
            '*',
        );
    }

    private updateCurrentView(sourceCode, path) {
        const currentView = this.$store.state.builder.currentView || {};
        const selectedView = find(sourceCode.modules, {
            path,
        });
        if (selectedView) {
            this.updateSelectedPage(selectedView);
        }
        if (selectedView && currentView.path !== selectedView.path) {
            this.$store.dispatch('builder/updateCurrentView', selectedView);
        }
    }

    private togglePreviewView() {
        const preview: any = this.$refs.preview;
        preview.openFullscreen();
    }

    private downloadFile() {
        const currentView = this.$store.state.builder.currentView;
        const extension = currentView.title.split('.').pop();
        const blob = new Blob([currentView.code], { type: `application/${extension}` });

        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, currentView.title);
        } else {
            const elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = currentView.title;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }

        this.$Message.success('File downloaded');
    }

    private copyToClipboard() {
        const currentView = this.$store.state.builder.currentView;
        const code = currentView.code;
        if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
            const textarea = document.createElement('textarea');
            textarea.textContent = code;
            textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                this.$Message.success('File copied to clipboard');
                return document.execCommand('copy'); // Security exception may be thrown by some browsers.
            } catch (ex) {
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    private mounted() {
        const frame = document.getElementById('sandbox') as HTMLIFrameElement;

        // Bind Event Listener to observe frame incoming messages
        window.addEventListener(
            'message',
            event => {
                const sourceCode = this.$store.state.builder.sourceCode;
                const currentView = this.$store.state.builder.currentView || {};
                if (event) {
                    if (event.data && event.data.type === 'initialized') {
                        frame.contentWindow!.postMessage(
                            { type: 'raw-compile', raw: sourceCode, codesandbox: true },
                            '*',
                        );
                    }

                    if (event.data && event.data.type === 'done') {
                        if (currentView.path) {
                            this.updateCurrentView(sourceCode, currentView.path);
                        } else {
                            this.updateCurrentView(sourceCode, '/');
                        }
                    }

                    if (event.data && event.data.type === 'route-change') {
                        this.updateCurrentView(sourceCode, event.data.path);
                    }
                }
            },
            false,
        );
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.page-preview-block-wrapper {
    width: 100%;
    height: 100%;
}

.main {
    height: 100%;
    width: 100%;
}

.header {
    border-bottom: 2px solid #f5f5f5;
    padding: 5px 15px;
    height: 48px;

    .pu-btn {
        padding: 5px 8px;
        border: 1px solid #dcdee2;
        border-radius: 3px;
        cursor: pointer;
    }
}

.float-right {
    float: right;
    display: block;
}

.main {
    padding: 0px;

    iframe {
        overflow: hidden;
    }
}

.space {
    margin: 0 5px;
}

.preview-btn {
    .ivu-icon {
        font-size: 18px;
    }
}
</style>