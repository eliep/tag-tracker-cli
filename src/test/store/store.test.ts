import { Store, StoreEntry } from "../../main/store/store";
import moment = require("moment");

describe('Parsing categories', () => {
    test('parse empty categories', () => {
        const categories: string[] = []
        const parsed = StoreEntry.parseCategories(categories);
        expect(parsed.size).toBe(0);
    });

    test('parse multiple categories', () => {
        const categories: string[] = ["a:1", "bb:22", "ccc:333"]
        const parsed = StoreEntry.parseCategories(categories);
        expect(parsed.size).toBe(3);
        expect(parsed.get("a")).toEqual("1");
        expect(parsed.get("bb")).toEqual("22");
        expect(parsed.get("ccc")).toEqual("333");
    });

    test('parse malformed categories', () => {
        const categories: string[] = ["a", ":22", "one:good", "ccc:"]
        const parsed = StoreEntry.parseCategories(categories);
        expect(parsed.size).toBe(1);
        expect(parsed.get("one")).toBe("good");
    });
});

describe('Parsing StoreEntry from csv line', () => {
    test('with valid csv', () => {
        const parser = StoreEntry.fromCsvLine(Store.csvConfig);
        const entry = parser('"2057-10-14T16:38:46.919Z","test","passing","8","[]"');
        const expected = new StoreEntry(moment("2057-10-14T16:38:46.919Z"),"test",8, new Map<string, string>(),"passing");
        expect(entry).toEqual(expected);
    });

    test('with invalid csv, throw an error', () => {
        const parser = StoreEntry.fromCsvLine(Store.csvConfig);
        expect(() => {
            parser('"2057-10-14T16:38:46.919Z,"passing","passing","8","[]"')
        }).toThrowError(Error);
    });
});
