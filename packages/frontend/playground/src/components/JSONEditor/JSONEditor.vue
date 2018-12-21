<template>
  <div class="code-mirror-container">
    <codemirror :value="json" ref="codeblock" :options="options" @input="onChange"></codemirror>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { codemirror } from 'vue-codemirror';

import '@/assets/codemirror.css';

// language
import 'codemirror/lib/codemirror.js';
// styleSelectedText
import 'codemirror/addon/selection/mark-selection.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/comment/continuecomment.js';
import 'codemirror/addon/comment/comment.js';
// highlightSelectionMatches
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/scroll/annotatescrollbar.js';
import 'codemirror/addon/search/matchesonscrollbar.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/search/match-highlighter.js';
// keyMap
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/addon/dialog/dialog.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/search/search.js';
import 'codemirror/keymap/sublime.js';
// foldGutter
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/indent-fold.js';
import 'codemirror/addon/fold/markdown-fold.js';
import 'codemirror/addon/fold/xml-fold.js';

@Component({
    props: {
        data: Object,
        onChange: Function,
    },
    components: {
        codemirror,
    },
})
export default class JSONEditor extends Vue {
    private data = this.data;

    get json() {
        return JSON.stringify(this.data || {}, null, 2);
    }

    private options = {
        tabSize: 4,
        foldGutter: true,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        keyMap: 'sublime',
        mode: 'application/ld+json',
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        theme: 'default',
        extraKeys: {
            F11(cm) {
                cm.setOption('fullScreen', !cm.getOption('fullScreen'));
            },
            Esc(cm) {
                if (cm.getOption('fullScreen')) {
                    cm.setOption('fullScreen', false);
                }
            },
        },
    };

    public refresh() {
        this.$nextTick(() => {
            const codeblock: any = this.$refs.codeblock;
            codeblock.codemirror.refresh();
        });
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.code-mirror-container {
    code {
        font-family: courier, monospace;
        font-size: 80%;
        color: #418a8a;
    }

    .CodeMirror {
        height: auto !important;
    }
}
</style>