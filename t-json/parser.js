var JSONParser = /** @class */ (function () {
    function JSONParser(input) {
        this.pos = 0;
        this.input = input;
    }
    JSONParser.prototype.parseValue = function () {
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
                throw new Error("Invalid JSON value at position ".concat(this.pos));
        }
    };
    JSONParser.prototype.currentToken = function () {
        return this.input.charAt(this.pos);
    };
    JSONParser.prototype.parse = function () {
        this.consumeWhitespace();
        var result = this.parseValue();
        this.consumeWhitespace();
        if (this.hasNext()) {
            throw new Error("Unexpected token at position ".concat(this.pos, "-").concat(this.currentToken()));
        }
        return result;
    };
    JSONParser.prototype.consumeWhitespace = function () {
        while (/\s/.test(this.currentToken())) {
            this.consume();
        }
    };
    JSONParser.prototype.hasNext = function () {
        this.consumeWhitespace();
        return this.currentToken() !== undefined;
    };
    JSONParser.prototype.consume = function (expected) {
        if (expected && this.currentToken() !== expected) {
            throw new Error("Expected ".concat(expected, " at position ").concat(this.pos));
        }
        this.pos++;
        while (this.currentToken() === " " ||
            this.currentToken() === "\t" ||
            this.currentToken() === "\n" ||
            this.currentToken() === "\r") {
            this.pos++;
        }
    };
    JSONParser.prototype.optionalConsume = function (expected) {
        if (this.currentToken() === expected) {
            this.pos++;
            // Skip over any whitespace characters
            while (this.currentToken() === " " ||
                this.currentToken() === "\t" ||
                this.currentToken() === "\n" ||
                this.currentToken() === "\r") {
                this.pos++;
            }
            return true;
        }
        return false;
    };
    JSONParser.prototype.parseEscape = function () {
        this.consume();
        switch (this.currentToken()) {
            case '"':
            case '\\':
            case '/':
                var c = this.currentToken();
                this.consume();
                return c;
            case 'b':
                this.consume();
                return '\b';
            case 'f':
                this.consume();
                return '\f';
            case 'n':
                this.consume();
                return '\n';
            case 'r':
                this.consume();
                return '\r';
            case 't':
                this.consume();
                return '\t';
            case 'u':
                this.consume();
                var code = parseInt(this.input.substring(this.pos, 4), 16);
                if (isNaN(code)) {
                    throw new Error("Invalid Unicode escape sequence at position ".concat(this.pos));
                }
                this.pos += 4;
                return String.fromCharCode(code);
            default:
                throw new Error("Invalid escape sequence at position ".concat(this.pos));
        }
    };
    JSONParser.prototype.parseString = function () {
        var str = '';
        this.consume('"');
        while (this.currentToken() !== '"') {
            if (this.currentToken() === '\\') {
                str += this.parseEscape();
            }
            else {
                str += this.currentToken();
                this.pos++;
            }
        }
        this.consume('"');
        return str;
    };
    JSONParser.prototype.parsePair = function () {
        var key = this.parseString();
        this.consume(':');
        var value = this.parseValue();
        return { key: key, value: value };
    };
    JSONParser.prototype.parseObject = function () {
        var obj = {};
        this.consume("{");
        while (this.currentToken() !== "}") {
            var pair = this.parsePair();
            obj[pair.key] = pair.value;
            if (this.currentToken() === ",") {
                this.consume(",");
            }
            else if (this.currentToken() !== "}") {
                throw new Error("Invalid object at position ".concat(this.pos));
            }
        }
        this.consume("}");
        return obj;
    };
    JSONParser.prototype.parseDigits = function () {
        var str = '';
        if (this.currentToken() === '0') {
            str += this.currentToken();
            this.consume();
        }
        else if (this.currentToken() >= '1' && this.currentToken() <= '9') {
            str += this.currentToken();
            this.consume();
            while (this.currentToken() >= '0' && this.currentToken() <= '9') {
                str += this.currentToken();
                this.consume();
            }
        }
        else {
            throw new Error("Invalid JSON number at position ".concat(this.pos));
        }
        return str;
    };
    JSONParser.prototype.parseNumber = function () {
        var str = '';
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
    };
    JSONParser.prototype.parseArray = function () {
        var arr = [];
        this.consume("[");
        while (this.currentToken() !== "]") {
            var value = this.parseValue();
            arr.push(value);
            if (this.currentToken() === ",") {
                this.consume(",");
            }
            else if (this.currentToken() !== "]") {
                throw new Error("Invalid array at position ".concat(this.pos));
            }
        }
        this.consume("]");
        return arr;
    };
    JSONParser.prototype.parseTrue = function () {
        this.consume('t');
        this.consume('r');
        this.consume('u');
        this.consume('e');
        return true;
    };
    JSONParser.prototype.parseFalse = function () {
        this.consume('f');
        this.consume('a');
        this.consume('l');
        this.consume('s');
        this.consume('e');
        return false;
    };
    JSONParser.prototype.parseNull = function () {
        this.consume('n');
        this.consume('u');
        this.consume('l');
        this.consume('l');
        return null;
    };
    return JSONParser;
}());
