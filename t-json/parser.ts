type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue }
type JSONArray = JSONValue[];

class JSONParser {
    private pos = 0;
    private input: string;

    constructor(input: string) {
        this.input = input;
    }

    private parseValue(): JSONValue {
        switch (this.currentToken()) {
            case '{':
                return this.parseObject();
            case '[':
                return this.parseArray();
            case '"':
                return this.parseString();
            case '-':
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                return this.parseNumber();
            case 't':
                return this.parseTrue();
            case 'f':
                return this.parseFalse();
            case 'n':
                return this.parseNull();
            default:
                throw new Error(`Invalid JSON value at position ${this.pos}`);
        }
    }

    private parseString(): string {
        let str = '';

        this.consume('"');

        while (this.currentToken() !== '"') {
            if (this.currentToken() === '\\') {
                str += this.parseEscape();
            } else {
                str += this.currentToken();
                this.pos++;
            }
        }

        this.consume('"');

        return str;
    }

    private parsePair(): { key: string, value: JSONValue } {
        const key = this.parseString();

        this.consume(':');

        const value = this.parseValue();

        return { key, value };
    }

    private parseObject(): JSONObject {
        const obj: JSONObject = {};

        this.consume("{");

        while (this.currentToken() !== "}") {
            const pair = this.parsePair();
            obj[pair.key] = pair.value;

            if (this.currentToken() === ",") {
                this.consume(",");
            } else if (this.currentToken() !== "}") {
                throw new Error(`Invalid object at position ${this.pos}`);
            }
        }

        this.consume("}");

        return obj;
    }

    private parseDigits(): string {
        let str = '';

        if (this.currentToken() === '0') {
            str += this.currentToken();
            this.consume();
        } else if (this.currentToken() >= '1' && this.currentToken() <= '9') {
            str += this.currentToken();
            this.consume();

            while (this.currentToken() >= '0' && this.currentToken() <= '9') {
                str += this.currentToken();
                this.consume();
            }
        } else {
            throw new Error(`Invalid JSON number at position ${this.pos}`);
        }

        return str;
    }

    private parseNumber(): number {
        let str = '';

        if (this.currentToken() === '-') {
            str += '-';
            this.consume('-');
        }

        str += this.parseDigits();

        if (this.currentToken() === '.') {
            str += '.';
            this.consume('.');
            str += this.parseDigits();
        }

        if (this.currentToken() === 'e' || this.currentToken() === 'E') {
            str += this.currentToken();
            this.consume();

            if (this.currentToken() === '+' || this.currentToken() === '-') {
                str += this.currentToken();
                this.consume();
            }

            str += this.parseDigits();
        }

        return parseFloat(str);
    }

    private parseArray(): JSONArray {
        const arr: JSONArray = [];

        this.consume("[");

        while (this.currentToken() !== "]") {
            const value = this.parseValue();
            arr.push(value);

            if (this.currentToken() === ",") {
                this.consume(",");
            } else if (this.currentToken() !== "]") {
                throw new Error(`Invalid array at position ${this.pos}`);
            }
        }

        this.consume("]");

        return arr;
    }
}