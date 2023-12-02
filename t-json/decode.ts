type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue }
type JSONArray = JSONValue[];

export class JSONParser {
    private pos = 0;
    private input: string;

    constructor(input: string) {
        this.input = input;
    }

    public parse(): JSONValue {
        this.consumeWhitespace();

        console.log(this.input);

        const result = this.parseValue();

        this.consumeWhitespace();

        if (this.hasNext()) {
            throw new Error(`Unexpected token at position ${this.pos}-${this.currentToken()}`);
        }

        return result;
    }

    private currentToken(): string {
        return this.input.charAt(this.pos);
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

    private consumeWhitespace(): void {
        while (/\s/.test(this.currentToken())) {
            this.consume();
        }
    }

    private hasNext(): boolean {
        return this.currentToken() !== "";
    }

    private consume(expected?: string): void {
        if (expected && this.currentToken() !== expected) {
            throw new Error(`Expected ${expected} at position ${this.pos}`);
        }

        this.pos++;

        while (
            this.currentToken() === " " ||
            this.currentToken() === "\t" ||
            this.currentToken() === "\n" ||
            this.currentToken() === "\r"
        ) {
            this.pos++;
        }
    }

    private optionalConsume(expected: string): boolean {
        if (this.currentToken() === expected) {
            this.pos++;
            // Skip over any whitespace characters
            while (
                this.currentToken() === " " ||
                this.currentToken() === "\t" ||
                this.currentToken() === "\n" ||
                this.currentToken() === "\r"
            ) {
                this.pos++;
            }

            return true;
        }

        return false;
    }

    private parseEscape(): string {
        this.consume();

        switch (this.currentToken()) {
            // If the escape sequence is a double quote, backslash, or forward slash, return the corresponding character
            case '"':
            case '\\':
            case '/':
                const c = this.currentToken();
                this.consume();
                return c;
            // If the escape sequence is a backspace, return the corresponding character
            case 'b':
                this.consume();
                return '\b';
            // If the escape sequence is a form feed, return the corresponding character
            case 'f':
                this.consume();
                return '\f';
            // If the escape sequence is a newline, return the corresponding character
            case 'n':
                this.consume();
                return '\n';
            // If the escape sequence is a carriage return, return the corresponding character
            case 'r':
                this.consume();
                return '\r';
            // If the escape sequence is a tab, return the corresponding character
            case 't':
                this.consume();
                return '\t';
            // If the escape sequence is a Unicode code point, parse it and return the corresponding character
            case 'u':
                this.consume();
                const code = parseInt(this.input.substring(this.pos, 4), 16);

                if (isNaN(code)) {
                    throw new Error(`Invalid Unicode escape sequence at position ${this.pos}`);
                }

                this.pos += 4;

                return String.fromCharCode(code);
            default:
                throw new Error(`Invalid escape sequence at position ${this.pos}`);
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

    private parseTrue(): true {
        this.consume('t');
        this.consume('r');
        this.consume('u');
        this.consume('e');
        return true;
    }

    private parseFalse(): false {
        this.consume('f');
        this.consume('a');
        this.consume('l');
        this.consume('s');
        this.consume('e');
        return false;
    }

    private parseNull(): null {
        this.consume('n');
        this.consume('u');
        this.consume('l');
        this.consume('l');
        return null;
    }
}