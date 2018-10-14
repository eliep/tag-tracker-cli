const clc = require("cli-color");
const CLI = require("clui");

export type CliStyle = (chunks: string) => string

export type ColumnOptions = {
    align: "left" | "right";
    size: number;
}

export type TableOptions = {
    pager: boolean;
    header: boolean;
    headerStyle?: CliStyle[];
    columns: ColumnOptions[];
}

export function tableGenerator(data: string[][], tableOptions: TableOptions) {
    function* generate() {
        if (tableOptions.header) {
            yield* generateLine(data.shift(), tableOptions.columns, tableOptions.headerStyle);
        }

        for (let columns of data) {
            yield* generateLine(columns, tableOptions.columns, []);
        }

        yield null;
    }
    return generate()
}

function* generateLine(columns: string[], formats: ColumnOptions[], styles: CliStyle[] = []): IterableIterator<string> {

    const columnSizes = sizeOfColumns(formats, columns.length);
    let line = new CLI.Line();
    let nextColumns = new Array<string>(columns.length).fill("");
    let overMultipleLines = false;

    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const format = formats[i];
        const size = columnSizes[i];

        let { columnValue, nextColumnValue } = splitColumn(column, size, " ");

        if (typeof nextColumnValue !== "undefined" && nextColumnValue !== "") {
            nextColumns[i] = nextColumnValue;
            overMultipleLines = true;
        }

        styles.forEach(style => {
            columnValue = style(columnValue);
        });

        if (format["align"] === "right") {
            const columnExtraLength = columnValue.length - clc.getStrippedLength(columnValue);
            columnValue = columnValue.padStart(size + columnExtraLength);
        }

        line.column(columnValue, size);
    }

    yield line.fill().contents();

    if (overMultipleLines === true) {
        yield* generateLine(nextColumns, formats, styles);
    }
}


function sizeOfColumns(formats: ColumnOptions[], columnCount: number) {
    let columnSizes = new Array<number>(columnCount);
    let totalSize = 0;
    for (let i = 0; i < columnCount; i++) {
        if (formats.length <= i) {
            columnSizes[i] = 20;
        } else if (i < columnCount - 1 || formats[i].size !== -1) {
            columnSizes[i] = formats[i].size
        } else {
            columnSizes[i] = clc.windowSize.width - totalSize
        }
        totalSize += columnSizes[i];
    }

    return columnSizes;
}

function splitColumn(column: string, columnSize: number, columnSeparator: string = " ") {
    let remainingSize = columnSize - columnSeparator.length;
    let printableColumnSize = clc.getStrippedLength(column);
    let columnValue = column;
    let nextColumnValue = "";

    if (!(printableColumnSize <= remainingSize)) {
        columnValue = columnValue.substr(0, remainingSize);
        let extraSpace = columnValue.length - clc.getStrippedLength(columnValue);
        columnValue += column.substr(remainingSize, extraSpace);
        nextColumnValue = column.substr(remainingSize + extraSpace);
    }

    columnValue = columnValue.concat(columnSeparator);

    return {
        columnValue,
        nextColumnValue
    };
}
