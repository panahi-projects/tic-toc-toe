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
//# sourceMappingURL=createElement.js.map