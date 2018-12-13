<template>
	<div class="code-mirror-container">
		<codemirror v-model="code" ref="codeblock" :options="options"></codemirror>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { codemirror } from 'vue-codemirror';

import '@/assets/codemirror.css';

// language
import 'codemirror/mode/vue/vue.js';
// theme css
// active-line.js
import 'codemirror/addon/selection/active-line.js';
// styleSelectedText
import 'codemirror/addon/selection/mark-selection.js';
import 'codemirror/addon/search/searchcursor.js';
// highlightSelectionMatches
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
    props: ['code'],
    components: {
        codemirror,
    },
})
export default class CodePreview extends Vue {
    private options = {
        tabSize: 4,
        foldGutter: true,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        keyMap: 'sublime',
        mode: 'text/x-vue',
        lineWrapping: true,
        theme: 'default',
        extraKeys: {
            F11(cm) {
                cm.setOption('fullScreen', !cm.getOption('fullScreen'));
            },
            Esc(cm) {
                if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
            },
        },
    };

    public refresh() {
        this.$nextTick(() => {
            let codeblock: any = this.$refs.codeblock;
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