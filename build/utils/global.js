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