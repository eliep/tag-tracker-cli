const clc = require("cli-color");

import { Moment } from "moment";
import { Config, CliListOption } from "../config/config";
import { DateRange } from "./date";
import { Store, StoreEntry } from "../store/store";
import { filter, map, forEach } from "../stream/transformer";
import { renderTable, renderList } from "../cli/render"

class ListEntry {
    name: string;
    lastDate: Moment;
    count: number;

    constructor(name: string, lastDate: Moment, count: number) {
        this.name = name;
        this.lastDate = lastDate;
        this.count = count;
    }

    merge(entry: ListEntry) {
        if (entry) {
            this.count = entry.count + 1;
            if (entry.lastDate.isAfter(this.lastDate)) {
                this.lastDate = entry.lastDate
            }
        }
        return this;
    }

    compareTo(entry: ListEntry) {
        if (this.count > entry.count) {
            return -1;
        } else if (this.count < entry.count) {
            return 1;
        } else {
            return 0;
        }
    }

    static fromStoreEntry(storeEntry: StoreEntry) {
        return new ListEntry(storeEntry.tag, storeEntry.date, 1);
    }

    static compare(entry1: ListEntry, entry2: ListEntry) {
        return entry1.compareTo(entry2);
    }
}

export function list(config: Config, store: Store) {
    return (cliOption: CliListOption) => {
        const options = config.buildListOption(cliOption);
        const dateRange = DateRange.build(options.size, options.future);

        const entries = new Map<string, ListEntry>();
        store
            .read()
            .pipe(map((storeEntry: StoreEntry) => ListEntry.fromStoreEntry(storeEntry)))
            .pipe(filter( (listEntry: ListEntry) => dateRange.contains(listEntry.lastDate)))
            .pipe(forEach((listEntry: ListEntry) => {
                const updatedListEntry = listEntry.merge(entries.get(listEntry.name));
                entries.set(listEntry.name, updatedListEntry);
            }))
            .on("finish",() => {
                const sortedEntries = Array
                    .from(entries.values())
                    .sort(ListEntry.compare);

                render(sortedEntries, options.compact, {
                    pager: false,
                    header: true,
                    headerStyle: [clc.bold],
                    columns: [
                        { "align": "left", "size": 30 },
                        { "align": "right", "size": 6 },
                        { "align": "right", "size": 12 }
                    ]
                });
            });
    }
}

function render(listEntries: ListEntry[], compact: boolean, tableOptions: any) {
    if (!compact) {
        const results = detailledFormat(listEntries);
        renderTable(results, tableOptions);
    } else {
        const result = compactedFormat(listEntries);
        renderList(result);
    }
}

function detailledFormat(listEntries: ListEntry[]) {
    return [
        ["Name", "Count", "Last Date"]
    ].concat(listEntries
        .map(listEntry => {
            const day = listEntry.lastDate.format("YYYY/MM/DD");
            return [ listEntry.name, clc.green(listEntry.count.toString()), day ];
        })
    );
}

function compactedFormat(listEntries: ListEntry[]) {
    return listEntries.map(listEntry => listEntry.name);
}
