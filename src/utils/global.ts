export const generateID = (length: number): string => {
    const chars: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result: string = '';
    const charsLength: number = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }

    return result;
};
export const groupBy = (obj, iteratee): { [key: number]: number[] } => {
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
