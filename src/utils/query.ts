export function parseQueryKeyValue(str: string): any {
    const pairs = str.split('&');
    return pairs.reduce((result, pair) => {
        const tmp = pair.split('=');
        if (tmp.length !== 2) return result;

        result[tmp[0]] = tmp[1];
        return result;
    }, {});
}