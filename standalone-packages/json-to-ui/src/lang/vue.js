import helpers from './../helpers';
import prettier from 'prettier/standalone';
import parserBabylon from 'prettier/parser-babylon';
import parserPostCSS from 'prettier/parser-postcss';
import parserHTML from 'prettier/parser-html';

const { typeOf, camelCaseToDash, fragment, pascalCase, checkUrl, injectExternalUrlCode, uniqueId } = helpers;

const templateReg = /<(?:\/)?template[\s\S]*?(?:lang="\s*(.*)\s*")?\s*>/gi;
const scriptReg = /<(?:\/)?script[\s\S]*?(?:lang="\s*(.*)\s*")?\s*>/gi;
const styleReg = /<(?:\/)?style[\s\S]*?(?:lang="\s*(.*)\s*")?\s*(?:scoped)?\s*>/gi;
let uiKitComponents = {};
let componentData = {};
let componentActions = [];

/**
 * @description Generator router file
 *
 * @param {Array} routes - array of routes
 * @return {String} - formatted code
 */
function getRouter(routes = [], options = {}) {
    let formatter = options.formatter || {};
    let parser = 'babylon';
    let router = `
        import Vue from "vue";
        import Router from "vue-router";
        ${routes.reduce((acc, route) => {
            const imports = acc.includes(`${route.name}.vue`)
                ? ''
                : `import ${route.name} from "${route.directoryPath}/${route.name}.vue";`;
            return acc + imports;
        }, '')}
        
        Vue.use(Router);
        
        export default new Router({
            routes: [
        ${routes.reduce((acc, route) => {
            return (
                acc +
                `{
                path: "${route.path}",
                name: "${route.name}",
                component: ${route.name}
            },`
            );
        }, '')}
            ]
        });
    `;
    let plugins = [parserBabylon];
    let code = prettier.format(router, Object.assign({ parser, plugins }, formatter));

    return code;
}

/**
 * @description Generate commons to inject to app
 *
 * @param {Array} commons - array of common library
 * @return {String} - formatted code
 */
function getCommons(commons = {}, options = {}) {
    let formatter = options.formatter || {};
    let parser = 'babylon';
    let types = Object.keys(commons);
    let externalUrls = [];
    let common = `
        import Vue from 'vue';
        ${types.reduce((acc, type) => {
            let imports = '';
            let dependencies = commons[type];
            for (let i = 0; i < dependencies.length; i++) {
                const isUrl = checkUrl(dependencies[i]);
                if (!isUrl) {
                    imports += `import '${dependencies[i]}';`;
                } else {
                    externalUrls.push(dependencies[i]);
                }
            }
            return acc + imports;
        }, '')}

        ${
            externalUrls.length
                ? `
            const externalUrls = [${externalUrls.reduce((acc, value) => acc + `"${value}",`, '')}];
            ${injectExternalUrlCode()}
        `
                : ''
        }
    `;

    let plugins = [parserBabylon];
    let code = prettier.format(common, Object.assign({ parser, plugins }, formatter));

    return code;
}

/**
 * @description Generate the vue code block for template, style & typescript
 *
 * @param {String} code - code block to be formatted
 * @param {String} block - type of the block i.e template, script, style
 * @param {String} expReg - regex
 * @return {String} - formatted code
 */
function getCode(code, block, expReg, formatter = {}) {
    let split = code.split(expReg, 4);
    let match = code.match(expReg);
    if (!match) {
        return null;
    }
    if (!/src/.test(match)) {
        if (block === 'template') {
            if (!split[1]) {
                let comment = "<!-- Automagically generated by 'jsdocs' -->";
                let parser = 'html';
                let plugins = [parserHTML];
                let code = prettier.format(split[2], { parser, plugins, htmlWhitespaceSensitivity: 'ignore' });
                // swtich prettier.format(code, {parser: "vue"})
                return comment + '\n' + match[0] + '\n' + code + '\n' + match[1];
            }
        } else if (block === 'style') {
            if (split[1] === undefined || split[1] === 'scss' || split[1] === 'less') {
                let parser = 'css';
                let plugins = [parserPostCSS];
                let code = prettier.format(split[2], Object.assign({ parser, plugins }, formatter));
                return match[0] + '\n' + code + '\n' + match[1];
            }
        } else {
            if (split[1] === undefined || split[1] === 'typescript') {
                let parser = split[1] ? split[1] : 'babylon';
                let plugins = [parserBabylon];
                let code = prettier.format(split[2], Object.assign({ parser, plugins }, formatter));
                return match[0] + '\n' + code + '\n' + match[1];
            }
        }
    }
    return match[0] + split[2] + match[1];
}

/**
 * @description format the generated vue code
 *
 * @param {String} text - code to be formatted
 * @return {String} - formatted vue code
 */
const vueFormatter = function(text, formatter = {}) {
    if (!text) {
        return;
    } else {
        let html = getCode(text, 'template', templateReg, formatter.html);
        let script = getCode(text, 'script', scriptReg, formatter.script);
        let style = getCode(text, 'style', styleReg, formatter.style);
        return (html ? html + '\n' : '') + (script ? '\n' + script + '\n' : '') + (style ? '\n' + style + '\n' : '');
    }
};

/**
 * @description Construct vue template from the json lookup
 *
 * @param {Object} dom - jsfom reference
 * @param {Object} template - json template data
 * @param {Boolean} root - root node or not
 *
 * @return {String} - template string
 */
const constructTemplate = function(dom, template, root, config) {
    const alias = config.alias || {};
    let element = fragment(
        `<${alias[template.element] || template.element}></${alias[template.element] || template.element}>`,
    );
    // if component is part of uikit then push the uiKitComponents to its respective array
    if (template.uikit) {
        uiKitComponents[template.uikit] = uiKitComponents[template.uikit] || [];
        uiKitComponents[template.uikit].push({
            name: template.name,
            element: template.element,
            native: template.native,
        });
    }

    // if data exists for component then inject
    if (template.data) {
        componentData = Object.assign(componentData, template.data);
    }

    // if actions exists then inject actions
    if (template.actions) {
        if (Array.isArray(template.actions)) {
            componentActions = componentActions.concat(template.actions);
        } else {
            componentActions.push(template.actions);
        }
    }

    // Add attributes to the element, if it exists
    if (template.properties) {
        const properties = Object.keys(template.properties);
        for (let i = 0; i < properties.length; i++) {
            let value = template.properties[properties[i]];
            if (properties[i] === 'style') {
                // if class doesn't exist or forced inlineStle then apply style inline
                if (!template.properties['class'] || template.inlineStyle) {
                    // Assuming only style property is passed as an object
                    value =
                        typeof value === 'object'
                            ? Object.entries(value).reduce((styleString, [propName, propValue]) => {
                                  return `${styleString}${camelCaseToDash(propName)}:${propValue};`;
                              }, '')
                            : value;
                } else {
                    value = '';
                }
            }
            // if property is array of classes
            if (properties[i] === 'class' && Array.isArray(value)) {
                value = value.join(' ');
            }

            // setAttribute doesnt allow special characters, so @ is replaced with at_
            properties[i] = properties[i].replace(/@/g, 'at_');

            // check if property value is not string or number
            if (typeof value === 'string') {
                element.setAttribute([properties[i]], value);
            } else if (typeof value === 'boolean') {
                // if true, then add the attr else not required
                if (value) {
                    element.setAttribute([properties[i]], value);
                } else {
                    let uuid = uniqueId();
                    element.setAttribute(`:${properties[i]}`, uuid);
                    componentData[uuid] = value;
                }
            } else if (typeof value === 'object') {
                // if property is an action then inject into components action
                if (properties[i] === 'action') {
                    componentActions.push(value);
                } else {
                    let uuid = uniqueId();
                    element.setAttribute(`:${properties[i]}`, uuid);
                    componentData[uuid] = value;
                }
            }
        }
    }
    // Add inner html, if content exist
    if (template.content) {
        element.innerHTML = template.content;
    }
    // Append children, if they exist
    if (template.children) {
        for (let i = 0; i < template.children.length; i++) {
            const children = constructTemplate(dom, template.children[i], false, config);
            element.appendChild(children);
        }
    }
    // if root element then wrap the template
    if (root) {
        let outerHTML = element.outerHTML.replace(/="true"/g, '').replace(/at_/g, '@');
        return `
            <template>${outerHTML}</template>
        `;
    }

    return element;
};

/**
 * @description Construct style node
 *
 * @param {String} template - json template
 * @param {String} style - style specific to the view
 * @return {String} - formatted style code
 */
const constructStyle = function(template, style = '', root = true) {
    // Add attributes to the element, if it exists
    if (template.properties) {
        const properties = Object.keys(template.properties);
        for (let i = 0; i < properties.length; i++) {
            let value = template.properties[properties[i]];
            let className = template.properties['class'];
            if (properties[i] === 'style' && className) {
                // Assuming only style property is passed as an object
                value =
                    typeof value === 'object'
                        ? Object.entries(value).reduce((styleString, [propName, propValue]) => {
                              return `${styleString}${camelCaseToDash(propName)}:${propValue};`;
                          }, '')
                        : value;
                // if array of classes
                if (Array.isArray(className)) {
                    className = className.map(cls => `.${cls}`).join('');
                    style += `${className}{${value}}`;
                } else {
                    style += `.${className}{${value}}`;
                }
            }
        }
    }
    // Append children, if they exist
    if (template.children) {
        for (let i = 0; i < template.children.length; i++) {
            let value = constructStyle(template.children[i], style, false);
            style = value;
        }
    }

    // if root element then wrap the template
    if (root) {
        return `
			<style scoped>${style}</style>	
		`;
    }

    return style;
};

/**
 * @description Construct the vue script
 *
 * @param {String} view - view name
 * @param {Object} meta - meta information for the page
 * @param {Object} data - data passed to the page
 * @return {String} - formatted vue script
 */
const constructScript = function({ view, meta = {}, data = {}, actions = [], options }) {
    const isEmptyMeta = Object.keys(meta).length === 0;
    let metaString = `${
        !isEmptyMeta
            ? `meta() {
		return {
			title: "${meta.title}",
			description: "${meta.description}"
		}
	}`
            : ''
    }`;
    let uikits = Object.keys(uiKitComponents);
    let components = [];
    let componentImports = `
        ${uikits.reduce((acc, uikit) => {
            let imports = 'import {';
            // filter unique dependencies
            let dependencies = uiKitComponents[uikit].filter(
                (component, index, self) => index === self.findIndex(t => t.name === component.name),
            );
            for (let i = 0; i < dependencies.length; i++) {
                imports += `${dependencies[i].name}${i !== dependencies.length ? ',' : ''}`;
                // dont inject reserved native html elements to components list like i, div etc..
                if (!dependencies[i].native) {
                    components.push(`${pascalCase(dependencies[i].element)}:${dependencies[i].name}`);
                }
            }
            imports += `} from '${uikit}';`;
            return acc + imports;
        }, '')}
    `;
    let viewData = Object.assign({}, data, componentData);
    let methods = '';

    // filter unique actions from array
    actions = actions.concat(componentActions);
    actions = new Set(actions.map(e => JSON.stringify(e)));
    actions = Array.from(actions).map(e => JSON.parse(e));

    if (options.script === 'typescript') {
        viewData = Object.entries(viewData).reduce((dataString, [propName, propValue], currentIndex, items) => {
            let value = propValue;
            switch (typeOf(propValue)) {
                case 'object':
                    value = JSON.stringify(propValue, undefined, 2);
                    break;
                case 'array':
                    value = JSON.stringify(propValue);
                    break;
                case 'string':
                    value = `"${value}"`;
                    break;
                default:
                    break;
            }
            return `${dataString}${propName}:${typeOf(propValue)} = ${value};\n`;
        }, '');
        return `
			<script lang="typescript">
				import { Component, Vue } from "vue-property-decorator";
                ${componentImports}

				@Component({
					components: {${components.join(',')}},
					props: {}
				})
				export default class ${view} extends Vue {
					${viewData}
					${metaString}
				}
			</script>
		`;
    } else {
        methods = actions
            .map(action => {
                const { name, args = [], body = '' } = action;
                return `
                ${name}: (${args.join(',')}) => {
                    ${body}
                } 
            `;
            })
            .join(',');
    }
    return `
        <script>
            ${componentImports}
            export default {
                name: "${view}",
                components: {${components.join(',')}},
				${metaString ? metaString + ',\n' : ''}data: function () {
					return ${JSON.stringify(viewData, undefined, 2)
                        .replace(/"true"/g, 'true')
                        .replace(/"false"/g, 'false')}
                },
                methods: {
                    ${methods}
                }				
            }
        </script>
    `;
};

const vue = function(template, options = {}) {
    // if router then generate route code
    if (options.isRouter) {
        return getRouter(template, options);
    }
    // if common then generate commmon code
    if (options.isCommons) {
        return getCommons(template, options);
    }

    // Reset all global values
    uiKitComponents = {};
    componentData = {};
    componentActions = [];

    const dom = document.createElement('div');
    const html = constructTemplate(dom, template, true, options);
    const style = constructStyle(template, '', true);
    const script = constructScript({
        view: template.name,
        meta: template.meta,
        data: template.data,
        actions: template.actions,
        options,
    });
    let fileContent = '';

    fileContent += html;
    fileContent += style;
    fileContent += script;
    if (options.format) {
        fileContent = vueFormatter(fileContent, options.formatter);
    }

    return fileContent;
};

export default vue;
