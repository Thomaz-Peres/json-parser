import { JSONParser } from "./parse"

describe("JSONParser", () => {
    describe("parser()", () => {

        test("empty json", () => {
            const input:string = "{}";
            const expectedOutput = {};
            const parser = new JSONParser(input);

            const output = parser.parse();

            expect(output).toEqual(expectedOutput);
        });

        test("test an object with string", () => {
            const input = '{"Name": "Thomaz", "age": "20"}';
            const expectedOutput = { Name: "Thomaz", age: "20" };
            const parser = new JSONParser(input);

            const output = parser.parse();

            expect(output).toEqual(expectedOutput);
        });

        test("test an object with only numbers", () => {
            const input = '{"Age": 20, "Height": 1.70}';
            const expectedOutput = { Age: 20, Height: 1.70 };
            const parser = new JSONParser(input);

            const output = parser.parse();

            expect(output).toEqual(expectedOutput);
        });

        test("test an object with bool and null", () => {
            const input = '{"True": false, "False": true, "Null": null}';
            const expectedOutput = { True: false, False: true, Null: null };
            const parser = new JSONParser(input);

            const output = parser.parse();

            expect(output).toEqual(expectedOutput);
        })
    });
});