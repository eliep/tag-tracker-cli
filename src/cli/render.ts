import { spawn, ChildProcess } from "child_process";
import { Writable} from "stream";
import { ReadableGenerator } from "../stream/generator";
import { CliStyle, TableOptions, ColumnOptions, tableGenerator } from "./table";

export { CliStyle, TableOptions, ColumnOptions };

export function renderList(data: string[]) {
    data
        .forEach(line => process.stdout.write(`${line}\n`));
}

export function renderTable(data: string[][], options: TableOptions) {

    let outputStream: Writable = process.stdout;
    let pager: ChildProcess = null;
    if (options.pager) {
        pager = spawn('less', ['-R', '-PM', '-n', '-e'],
            { stdio: ["pipe", process.stdout, process.stdin ] });
        outputStream = pager.stdin;
    }

    const tableStream = new ReadableGenerator({}, tableGenerator(data, options));
    tableStream.pipe(outputStream);
}
