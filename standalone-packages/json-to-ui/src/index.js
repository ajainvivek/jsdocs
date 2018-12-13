import vue from './lang/vue';

const jsontoui = function(template, lang, options) {
    let code = '';
    switch (lang) {
        case 'vue':
            code = vue(template, options);
            break;

        default:
            break;
    }
    return code;
};

export default jsontoui;
