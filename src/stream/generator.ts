import {Readable, ReadableOptions} from "stream";

export class ReadableGenerator extends Readable {
    private generator: IterableIterator<string>;

    constructor(options: ReadableOptions, generator: IterableIterator<string>) {
        super(options);
        this.generator = generator;
    }

    _read(size: number) {
        this.push(this.generator.next().value)
    }
}
