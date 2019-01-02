import uuid from 'uuid/v1';
import shortid from 'shortid';
import jsontoui from 'jsontoui';
import faker from 'faker';
import { camelCase, upperFirst, startCase, find, filter } from 'lodash';

export const generatePage = data => {
    const id = uuid();
    const name = upperFirst(camelCase(data.name));
    const template = Object.assign(data.template, {
        name,
        id,
        properties: Object.assign(data.template.properties, {
            id,
        }),
    });
    const code = jsontoui(template, data.lang, {
        format: true,
    });
    const jsonBuffer = btoa(JSON.stringify(template));
    let extension = '';
    switch (data.lang) {
        case 'vue':
            extension = 'vue';
            break;

        default:
            extension = '.js';
            break;
    }
    return {
        title: `${name}.${extension}`,
        path: data.path,
        source_id: data.source_id,
        shortid: shortid.generate(),
        is_binary: false,
        id,
        directory_shortid: data.directory_shortid,
        code,
        name,
        json_buffer: jsonBuffer,
    };
};

export const updatePage = ({ template, lang }) => {
    const code = jsontoui(template, lang, {
        format: true,
    });
    return code;
};

export const uniqueStringId = () => {
    return Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(2, 10);
};

const contructRoutePath = (path = '', dirs, shortid) => {
    const dir: any = find(dirs, {
        shortid,
    });
    if (dir.title !== 'src') {
        path = `/${dir.title}` + path;
        return contructRoutePath(path, dirs, dir.directory_shortid);
    }
    return `./${path.substring(1)}`;
};

export const generateRoute = ({ pages, sourceCode, lang }) => {
    const pageDirectory: any = find(sourceCode.directories, {
        title: 'pages',
    });
    const pageModules = filter(sourceCode.modules, {
        directory_shortid: pageDirectory.shortid,
    });
    pageModules.push(...pages);

    const routes = pageModules.map((module: any) => {
        const name = module.title.replace(/\.[^/.]+$/, '');
        return {
            name,
            path: module.path,
            directoryPath: contructRoutePath('', sourceCode.directories, pageDirectory.shortid),
        };
    });

    return jsontoui(routes, lang, {
        isRouter: true,
    });
};

export const generatePlugins = ({ external, lang }) => {
    return jsontoui(external, lang, {
        isCommons: true,
    });
};

export const dasherize = str => {
    return str.replace(/[A-Z]/g, (char, index) => {
        return (index !== 0 ? '-' : '') + char.toLowerCase();
    });
};

export const recursiveComponentUpdate = (components: any = [], filter, updatedComponent: any = {}) => {
    const { properties = {}, actions = {}, data = {} } = updatedComponent;

    components.forEach(component => {
        if (component['id'] === filter.id) {
            component['properties'] = component['properties'] || {};
            component['properties'] = Object.assign(component['properties'], properties);
            component['data'] = component['data'] || {};
            component['data'] = Object.assign(component['data'], data);
            component['actions'] = component['actions'] || {};
            component['actions'] = Object.assign(component['actions'], actions);
        }
        if (component['id'] && Array.isArray(component['children'])) {
            component['children'] = recursiveComponentUpdate(component['children'], filter, updatedComponent);
        }
    });
    return components;
};

export const recursiveComponentInject = (components: any = [], filter, updatedComponent = {}) => {
    components.forEach(component => {
        if (component['id'] === filter.id) {
            component['children'] = component['children'] || [];
            component['children'].push(updatedComponent);
        }
        if (component['id'] && Array.isArray(component['id']['children'])) {
            component['id']['children'] = recursiveComponentInject(
                component['id']['children'],
                filter,
                updatedComponent,
            );
        }
    });

    return components;
};

export const injectFakeData = component => {
    const replaceFakeData = content => {
        if (typeof content === 'string') {
            content = faker.fake(
                content
                    .replace(/{{/g, '<<<')
                    .replace(/}}/, '>>>')
                    .replace(/\(\(/g, '{{')
                    .replace(/\)\)/g, '}}'),
            );
            return content.replace(/<<</g, '{{').replace(/>>>/, '}}');
        }
        return content;
    };
    const replaceNestedProperties = properties => {
        const keys = Object.keys(properties);
        keys.forEach(key => {
            if (typeof properties[key] === 'object' && !Array.isArray(properties[key])) {
                replaceNestedProperties(properties[key]);
            } else {
                properties[key] = replaceFakeData(properties[key]);
            }
        });
        return properties;
    };
    if (typeof component.content === 'string') {
        component.content = replaceFakeData(component.content);
    }
    if (component.properties) {
        component.properties = replaceNestedProperties(component.properties);
    }
    return component;
};
