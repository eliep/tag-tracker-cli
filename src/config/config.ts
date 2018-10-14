import Configstore = require("configstore");
import defaultConfig = require("./defaultConfig");
const pkg = require("../../package.json");

export interface CliListOption {
    size?: number;
    future?: boolean;
    compact?: boolean;
}

export interface CliLogOption {
    size?: number;
    future?: boolean;
}

export interface CliAddOption {
    duration?: number;
    after?: number;
    before?: number;
    message?: string;
}

export interface HistorySettings {
    size: number;
    future: boolean;
}

export interface ListOption extends HistorySettings {
    compact: boolean;
}

export interface LogOption extends HistorySettings {
}

export interface AddOption {
    duration: number;
    days: number;
    message: string;
}

interface CommandOptions {
    add: AddOption;
    list: ListOption;
    log: LogOption;
}

export class Config {
    readonly store = new Configstore(pkg.name, defaultConfig);

    getStoreFilename(): string {
        return this.store.get("store.filename");
    }

    buildListOption(cliOption: CliListOption): ListOption {
        const defaultOption = this.getDefaultCommandOptions().list;
        const size = cliOption.size || defaultOption.size;
        const future = (cliOption.future  === undefined) ? defaultOption.future : cliOption.future;
        const compact = (cliOption.compact === undefined) ? defaultOption.compact : cliOption.compact;
        return { size, future, compact }
    }

    buildLogOption(cliOption: CliLogOption): LogOption {
        const defaultOption = this.getDefaultCommandOptions().log;
        const size = cliOption.size || defaultOption.size;
        const future = (cliOption.future  === undefined) ? defaultOption.future : cliOption.future;
        return { size, future };
    }

    buildAddOption(cliOption: CliAddOption): AddOption {
        const defaultOption = this.getDefaultCommandOptions().add;
        const duration = cliOption.duration || defaultOption.duration;
        const days = -cliOption.before || cliOption.after || defaultOption.days;
        const message = cliOption.message || defaultOption.message;

        return { duration, days, message };
    }

    private getDefaultCommandOptions(): CommandOptions {
        return this.store.get("default");
    }
}
