import uuid from 'uuid/v1';
import shortid from 'shortid';
import jsontoui from 'jsontoui';
import faker from 'faker';
import { camelCase, upperFirst, startCase, find, filter } from 'lodash';
import { AnySrvRecord } from 'dns';

export const generatePage = function (data) {
    let id = uuid();
    let name = upperFirst(camelCase(data.name));
    const template = Object.assign(data.template, {
        name,
        id,
        properties: Object.assign(data.template.properties, {
            id,
        }),
        data: {
            title: `This is your ${startCase(name)} page, start dragging and dropping components.`,
        },
    });
    let code = jsontoui(template, data.lang, {
        format: true,
    });
    let json_buffer = btoa(JSON.stringify(template));
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
        name: name,
        json_buffer,
    };
};

export const updatePage = function ({ template, lang }) {
    let code = jsontoui(template, lang, {
        format: true,
    });
    return code;
};

export const uniqueStringId = function () {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
};

const contructRoutePath = (path = '', dirs, shortid) => {
    let dir: any = find(dirs, {
        shortid,
    });
    if (dir.title !== 'src') {
        path = `/${dir.title}` + path;
        return contructRoutePath(path, dirs, dir.directory_shortid);
    }
    return `./${path.substring(1)}`;
};

export const generateRoute = function ({ page, sourceCode, lang }) {
    const pageDirectory: any = find(sourceCode.directories, {
        title: 'pages',
    });
    const pageModules = filter(sourceCode.modules, {
        directory_shortid: pageDirectory.shortid,
    });
    pageModules.push(page);

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

export const generatePlugins = function ({ external, lang }) {
    return jsontoui(external, lang, {
        isCommons: true,
    });
};

export const dasherize = function (string) {
    return string.replace(/[A-Z]/g, function (char, index) {
        return (index !== 0 ? '-' : '') + char.toLowerCase();
    });
};

export const recursiveComponentUpdate = function (components: any = [], filter, component: any = {}) {
    let { properties = {}, actions = {}, data = {} } = component;
    for (let i = 0; i < components.length; i++) {
        if (components[i]['id'] === filter.id) {
            components[i]['properties'] = components[i]['properties'] || {};
            components[i]['properties'] = Object.assign(components[i]['properties'], properties);
            components[i]['data'] = components[i]['data'] || {};
            components[i]['data'] = Object.assign(components[i]['data'], data);
            components[i]['actions'] = components[i]['actions'] || {};
            components[i]['actions'] = Object.assign(components[i]['actions'], actions);
            break;
        }
        if (components[i]['id'] && Array.isArray(components[i]['children'])) {
            components[i]['children'] = recursiveComponentUpdate(
                components[i]['children'],
                filter,
                component,
            );
        }
    }
    return components;
};

export const recursiveComponentInject = function (components: any = [], filter, component = {}) {
    for (let i = 0; i < components.length; i++) {
        if (components[i]['id'] === filter.id) {
            components[i]['children'] = components[i]['children'] || [];
            components[i]['children'].push(component);
            break;
        }
        if (components[i]['id'] && Array.isArray(components[i]['id']['children'])) {
            components[i]['id']['children'] = recursiveComponentInject(
                components[i]['id']['children'],
                filter,
                component,
            );
        }
    }
    return components;
};

export const injectFakeData = function (component) {
    let replaceFakeData = (content) => {
        if (typeof content === 'string') {
            content = faker.fake(content.replace(/{{/g, '<<<').replace(/}}/, '>>>').replace(/\(\(/g, '{{').replace(/\)\)/g, '}}'));
            return content.replace(/<<</g, '{{').replace(/>>>/, '}}');
        }
        return content;
    }
    let replaceNestedProperties = (properties) => {
        let keys = Object.keys(properties);
        keys.forEach((key) => {
            if (typeof properties[key] === 'object' && !Array.isArray(properties[key])) {
                replaceNestedProperties(properties[key]);
            } else {
                properties[key] = replaceFakeData(properties[key]);
            }
        });
        return properties;
    }
    if (typeof component.content === 'string') {
        component.content = replaceFakeData(component.content);
    }
    if (component.properties) {
        component.properties = replaceNestedProperties(component.properties);
    }
    return component;
}

