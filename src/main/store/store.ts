const fs = require("fs");
const stringify = require("csv-stringify");
const parse = require("csv-parse/lib/sync");
const moment = require("moment");

import { Moment } from "moment";
import { split, map } from "../stream/transformer";

export class StoreEntry {
    date: Moment;
    tag:string;
    duration: number;
    categories: Map<string, string>;
    message: string;

    constructor(date: Moment, tag: string, duration: number, categories: Map<string, string>, message: string) {
        this.date = date;
        this.tag = tag;
        this.duration = duration;
        this.categories = categories;
        this.message = message;
    }

    static fromCsvLine(csvConfig: any) {
        return (line: string) => {
            const csvEntries: string[][] = parse(line, csvConfig);
            const csvEntry = csvEntries[0];
            const categories = StoreEntry.parseCategories(JSON.parse(csvEntry[4]));

            return new StoreEntry(
                moment(csvEntry[0]),
                csvEntry[1],
                parseInt(csvEntry[3]),
                categories,
                csvEntry[2]);
        }
    }

    static parseCategories(categories: string[]) {
        if (categories === undefined) {
            return new Map<string, string>();
        }

        return categories.reduce( (parsedCategories, category) => {
            if (StoreEntry.isValidCategory(category)) {
                return parsedCategories;
            }
            return parsedCategories.set(category.split(":")[0], category.split(":")[1]);
        }, new Map<string, string>());
    }

    private static isValidCategory(category: string) {
        return category.indexOf(":") < 0 ||
            category.split(":")[0].length === 0 ||
            category.split(":")[1].length === 0;
    }

}

export class Store {
    static readonly csvConfig = { delimiter: ",", escape: "\\", quoted: true };
    readonly path: string;

    constructor(folder: string, filename: string = ".tags") {
        this.path = `${folder}/${filename}`;
    }

    write(days: number, data: any[]) {
        const stringifier = stringify(Store.csvConfig);
        const path = this.path;
        const datedData = data.slice();
        datedData.unshift(moment().add(days, "days").toISOString());

        stringifier.write(datedData);
        stringifier.on("readable", function() {
            fs.appendFileSync(path, stringifier.read(), "utf8");
        });
    }

    read(): NodeJS.ReadableStream {
        return fs
            .createReadStream(this.path, "utf8")
            .pipe(split())
            .pipe(map(StoreEntry.fromCsvLine(Store.csvConfig)));
    }
}
