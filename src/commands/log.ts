const clc = require("cli-color");

import { Moment } from "moment";
import { Config, CliLogOption } from "../config/config";
import { DateRange } from "./date";
import { Store, StoreEntry } from "../store/store";
import { filter, forEach } from "../stream/transformer";
import { renderTable } from "../cli/render"

class DateEntry {
    day: string;
    logEntries: LogEntry[];

    constructor(day: string, entries: LogEntry[]) {
        this.day = day;
        this.logEntries = entries;
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

    compact() {
        let groupedByTag = new Map<string, LogEntry>();
        for (let logEntry of this.logEntries) {
            let newLogEntry = logEntry.merge(groupedByTag.get(logEntry.tag));
            groupedByTag.set(logEntry.tag, newLogEntry);
        }
        this.logEntries = Array.from(groupedByTag.values());

        return this;
    }

    static compare(entry1: DateEntry, entry2: DateEntry) {
        return entry1.compareTo(entry2);
    }
}

class LogEntry {
    date: Moment;
    tag: string;
    duration: number;
    categories: Map<string, Set<string>>;
    message: string;

    constructor(date: Moment, tag: string, duration: number, categories: Map<string, string>, message: string) {
        this.date = date;
        this.tag = tag;
        this.duration = duration;
        this.categories = new Map<string, Set<string>>()
        categories.forEach((value, key) => {
            this.categories.set(key, new Set([value]));
        });
        this.message = message;
    }

    merge(otherEntry: LogEntry): LogEntry {
        if (!otherEntry) {
            return this;
        }

        this.duration += otherEntry.duration;
        otherEntry.categories.forEach((value, key) => {
            let newValue = (this.categories.has(key))
                ? new Set([...this.categories.get(key), ...value])
                : value;
            this.categories.set(key, newValue);
        });

        return this;
    }

    printableCategories() {
        let printableCategories: string[] = [];
        this.categories.forEach((value, key) => {
            printableCategories.push(`${clc.underline(key)}:${Array.from(value).join("/")}`);
        });
        return printableCategories;
    }

    static fromStoreEntry(storeEntry: StoreEntry) {
        return new LogEntry(storeEntry.date,
            storeEntry.tag,
            storeEntry.duration,
            storeEntry.categories,
            storeEntry.message);
    }
}

export function log(config: Config, store: Store) {
    return (cliOption: CliLogOption) => {
        const options = config.buildLogOption(cliOption);
        const dateRange = DateRange.build(options.size, options.future);

        const dateEntries = new Map<string, DateEntry>();
        store
            .read()
            .pipe(filter( (storeEntry: StoreEntry) => dateRange.contains(storeEntry.date)))
            .pipe(forEach((storeEntry: StoreEntry) => {
                const day = storeEntry.date.format("YYYYMMDD");
                if (!dateEntries.has(day)) {
                    dateEntries.set(day, new DateEntry(day, []));
                }
                dateEntries.get(day).logEntries.push(LogEntry.fromStoreEntry(storeEntry));
            }))
            .on("finish",async () => {
                const sortedDateEntries = Array
                    .from(dateEntries.values())
                    .sort(DateEntry.compare);

                const results = format(sortedDateEntries, options.compact);

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

function format(dateEntries: DateEntry[], compact: boolean) {
    return dateEntries
        .map(dateEntry => {
            if (compact) {
                dateEntry.compact();
            }

            return dateEntry.logEntries
                .map(logEntry => entryLines(logEntry, compact))
                .reduce((flat, next) => flat.concat(next), []);
        })
        .reduce((flat, next) => flat.concat(next), []);
}

function entryLines(logEntry: LogEntry, compact: boolean): string[][] {
    let entryLines = [
        [`${clc.cyan(logEntry.date.format("YYYY/MM/DD"))}`,
            clc.bold(clc.green(logEntry.duration.toString())),
            clc.bold(clc.yellow(logEntry.tag))],
    ];

    if (!compact && logEntry.message !== "") {
        entryLines.push(["", "", `${clc.underline("message")}:${logEntry.message}`]);
    }

    if (logEntry.categories !== undefined && logEntry.categories.size > 0) {
        const printableCategories = logEntry.printableCategories();
        entryLines.push(["", "", `${printableCategories.join(" ")}`]);
    }

    return entryLines;
}
