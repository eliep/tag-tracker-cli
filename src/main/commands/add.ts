const clc = require("cli-color");

import { Config, CliAddOption } from "../config/config";
import { Store } from "../store/store";

export function add(config: Config, store: Store) {
    return (tag: string, cliCategories: string[], cliOptions: CliAddOption) => {
        const options = config.buildAddOption(cliOptions);

        const categories = JSON.stringify(cliCategories);
        store.write(options.days, [ tag, options.message, options.duration, categories ]);

        const boldTag = clc.bold(tag);
        const duration = options.duration;
        const days = options.days;
        const message = options.message ? options.message : "-";

        const result = `Successfully added tag ${boldTag} (duration:${duration} days:${days} message:${message})\n`;
        process.stdout.write(result);
    }
}
