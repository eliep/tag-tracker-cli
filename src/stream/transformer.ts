import { Transform } from "stream";
import { StringDecoder } from "string_decoder";

export function split(matcher: RegExp = /\r?\n/) {
    const decoder = new StringDecoder();
    let soFar = '';

    return new Transform({
        transform(chunk, encoding, callback) {
            const buffer = decoder.write(chunk);
            let pieces = ((soFar != null ? soFar : '') + buffer).split(matcher);
            soFar = pieces.pop();

            for (let i = 0; i < pieces.length; i++) {
                this.push(pieces[i]);
            }
            callback();
        },
        flush(callback) {
            if (soFar != null) {
                callback(null, soFar);
            }
            callback();
        }
    });
}

export function filter<T>(condition: (chunk: T) => boolean) {
    return new Transform({
        objectMode: true,
        transform(chunk: T, encoding, callback) {
            if (condition(chunk)) {
                callback(null, chunk);
            } else {
                callback();
            }
        }
    });
}

export function map<T, U>(mapper: (chunk: T) => U) {
    return new Transform({
        objectMode: true,
        transform(chunk: T, encoding, callback) {
            callback(null, mapper(chunk));
        }
    });
}



export function forEach<T>(apply: (chunk: T) => void) {
    return new Transform({
        objectMode: true,
        transform(chunk: T, encoding, callback) {
            apply(chunk);
            callback();
        }
    });
}
