import { Encoder } from "./encode"

describe("Encode", () => {

    test("test encode object with object and array", () => {
        const expectedOutput = '{"name":"Reader","age":5,"arr":["arr1","arr2"],"obj":{"Heig":15,"Surname":"Teste"}}';
        const input = {
            name: "Reader",
            age: 5,
            arr: ["arr1", "arr2"],
            obj: { Heig: 15, Surname: "Teste" }
        };

        const output = new Encoder().encode(input);

        expect(output).toEqual(expectedOutput);
    });

    test("test encode simple object", () => {
        const expectedOutput = '{"name":"Reader","age":5,"True":true}';
        const input = {
            name: "Reader",
            age: 5,
            True: true
        };

        const output = new Encoder().encode(input);

        expect(output).toEqual(expectedOutput);
    })
});