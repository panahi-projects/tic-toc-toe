export const CreateElement = (elementObj) => {
    if (!elementObj || !elementObj.tag)
        return {};
    var element = document.createElement(elementObj.tag);
    for (var prop in elementObj) {
        if (prop === 'childNodes') {
            elementObj.childNodes.forEach(function (node) {
                element.appendChild(node);
            });
        }
        else if (prop === 'attributes') {
            elementObj.attributes.forEach(function (attr) {
                element.setAttribute(attr.key, attr.value);
            });
        }
        else if (prop === 'datasets') {
            elementObj.datasets.forEach(function (dataset) {
                element.dataset[dataset] = elementObj[dataset];
            });
        }
        else
            element[prop] = elementObj[prop];
    }
    return element;
};
export const generateID = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charsLength = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
};
export const groupBy = (obj, iteratee) => {
    const result = {};
    for (const key in obj) {
        const grouping = iteratee(obj[key], key, obj);
        if (!result[grouping]) {
            result[grouping] = [];
        }
        result[grouping].push(+key);
    }
    return result;
};
//# sourceMappingURL=global.js.map