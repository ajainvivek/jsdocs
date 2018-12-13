/**
 * @description typeof variable
 *
 * @param {Any} text - value to be passed
 * @return {String} - typeof the value
 */
const typeOf = function (value) {
    let type = 'any';

    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            type = 'array';
        } else if (Object.keys(value).length > 0) {
            type = 'object';
        }
    } else {
        type = typeof value;
    }
    return type;
};

/**
 * @description convert camelcase to dash
 *
 * @param {String} text - camelcase string to be dasherized
 * @return {String} - dasherized string
 */
const camelCaseToDash = function (myStr) {
    return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * @description convert string to camelize
 * 
 * @param {String} text - string to be camelcase
 * @return {String} - camelcase string
 */
const camelize = function (str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

/**
 * @description convert camelcase to dash
 *
 * @param {String} text - string
 * @return {String} - upper first string
 */
const upperFirst = function (myStr) {
    return myStr.replace(/-|\s/g, "").charAt(0).toUpperCase() + myStr.slice(1);;
};

/**
 * @description convert camelcase to dash
 *
 * @param {String} text - string
 * @return {String} - upper first string
 */
const uniqueId = function (myStr) {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return 'data_' + Math.random().toString(36).substr(2, 9);
};

const pascalCase = function (str) {
    return str.match(/[a-z]+/gi)
        .map(function (word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
        })
        .join('')
}

/**
 * @description check if string is url
 *
 * @param {Boolean} isUrl - is url or not
 */
const checkUrl = function (str) {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(str);
}

/**
 * @description create html fragment
 *
 * @param {String} html - html string
 */
const fragment = function (html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

const injectExternalUrlCode = () => {
    return `
        const injectExternalUrls = (urls) => {
            urls.forEach((url) => {
                const extension = url.split('.').pop();
                let element = null;
                if (extension === 'css') {
                    element = document.createElement('link');
                    element.rel = 'stylesheet';
                    element.href = 'data:text/css,' + escape('@import url("'+ url +'");');
                } else if (extension === 'js') {
                    element = document.createElement('script');
                    element.setAttribute('src', escape(url));
                } else {
                    return;
                }
                document.getElementsByTagName("head")[0].appendChild(element);
            });
        };
        injectExternalUrls(externalUrls);
    `
}

export default {
    typeOf,
    camelCaseToDash,
    camelize,
    fragment,
    pascalCase,
    checkUrl,
    injectExternalUrlCode,
    uniqueId
};
