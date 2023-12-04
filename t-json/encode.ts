export class Encoder {
    encode(input: unknown): string {
        if (!Array.isArray(input) && typeof input !== 'object') {
            throw new Error("Invalid json, json should start with [] or {}");
        }

        return this.encodeValue(input) as string;
    }

    private encodeValue(input: unknown) {
        if (Array.isArray(input))
            return this.encodeArray(input);

        if (input === null || input === undefined) {
            return null
        }

        if (!isNaN(+input)) {
            return input;
        }

        switch (typeof input) {
            case 'string':
                return `"${input}"`;
            case 'object':
                return this.encodeObject(input);
            default:
                throw new Error("Invalid value type");
        }
    }

    private encodeObject(input: object): string {
        let obj = '{';

        let i = 0;
        const objLen = Object.keys(input);
        for (let val in input) {
            const value = this.encodeValue(input[val]);

            const pair = `"${val}":${value}`;
            console.log(objLen);
            obj += pair;
            i++

            if (i < objLen.length) {
                obj += ',';
            } else {
                obj += '}';
            }
        }
        return obj;
    }

    public encodeArray(input: unknown[]): string {
        let arr = '[';

        let i = 0;
        for (const value of input) {
            const val = this.encodeValue(value);

            arr += val;

            i++;

            if (i < input.length) {
                arr += ',';
            } else {
                arr += ']';
            }
        }

        return arr;
    }
}