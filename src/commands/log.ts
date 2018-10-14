const clc = require("cli-color");

import { Config, CliLogOption } from "../config/config";
import { DateRange } from "./date";
import { Store, StoreEntry } from "../store/store";
import { filter, forEach } from "../stream/transformer";
import { renderTable } from "../cli/render"

class DateEntry {
    day: string;
    entries: StoreEntry[];

    constructor(day: string, entries: StoreEntry[]) {
        this.day = day;
        this.entries = entries;
    }

    compareTo(entry: DateEntry) {
        if (this.day > entry.day) {
            return -1;
        } else if (this.day < entry.day) {
            return 1;
        } else {
            return 0;
        }
    }

    static compare(entry1: DateEntry, entry2: DateEntry) {
        return entry1.compareTo(entry2);
    }
}

export function log(config: Config, store: Store) {
    return (cliOption: CliLogOption) => {
        const options = config.buildLogOption(cliOption);
        const dateRange = DateRange.build(options.size, options.future);

        const entries = new Map<string, DateEntry>();
        store
            .read()
            .pipe(filter( (entry: StoreEntry) => dateRange.contains(entry.date)))
            .pipe(forEach((entry: StoreEntry) => {
                const day = entry.date.format("YYYY/MM/DD");
                if (!entries.has(day)) {
                    entries.set(day, new DateEntry(day, []));
                }
                entries.get(day).entries.push(entry);
            }))
            .on("finish",async () => {
                const sortedDateEntries = Array
                    .from(entries.values())
                    .sort(DateEntry.compare);

                const results = format(sortedDateEntries);

                renderTable(results, {
                    pager: true,
                    header: false,
                    columns: [
                        { "align": "left", "size": 12 },
                        { "align": "right", "size": 5 },
                        { "align": "left", "size": -1 }
                    ],

                });
            });
    }
}

function format(dateEntries: DateEntry[]) {
    return dateEntries
        .map(dateEntry => {
            return dateEntry.entries
                .map(entry => entryLines(dateEntry, entry))
                .reduce((flat, next) => flat.concat(next), []);
        })
        .reduce((flat, next) => flat.concat(next), []);
}

function entryLines(dateEntry: DateEntry, entry: StoreEntry): string[][] {
    let entryLines = [
        [`${clc.cyan(dateEntry.day)}`,
            clc.bold(clc.green(entry.duration.toString())),
            clc.bold(clc.yellow(entry.tag))],
    ];

    if (entry.message !== "") {
        entryLines.push(["", "", `message:${entry.message}`]);
    }

    if (entry.categories !== undefined && entry.categories.size > 0) {
        const printableCategories = categoriesToString(entry.categories);
        entryLines.push(["", "", `${printableCategories.join(" ")}`]);
    }

    return entryLines;
}

function categoriesToString(categories: Map<string, string>) {
    let printableCategories: string[] = [];
    categories.forEach((value, key) => {
        printableCategories.push(`${key}:${value}`);
    });
    return printableCategories;
}
