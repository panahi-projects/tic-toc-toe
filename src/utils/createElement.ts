export const CreateElement = (elementObj: any): HTMLElement => {
    if (!elementObj || !elementObj.tag) return {} as HTMLElement;
    var element: HTMLElement = document.createElement(elementObj.tag);
    for (var prop in elementObj) {
        if (prop === 'childNodes') {
            elementObj.childNodes.forEach(function (node) {
                element.appendChild(node);
            });
        } else if (prop === 'attributes') {
            elementObj.attributes.forEach(function (attr) {
                element.setAttribute(attr.key, attr.value);
            });
        } else if (prop === 'datasets') {
            elementObj.datasets.forEach(function (dataset) {
                element.dataset[dataset] = elementObj[dataset];
            });
        } else element[prop] = elementObj[prop];
    }
    return element;
};
