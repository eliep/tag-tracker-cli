#!/usr/bin/env node
const pkg = require("../package.json");
const homedir = require('os').homedir();

import { Command } from "commander";
import { add } from "./commands/add";
import { list } from "./commands/list";
import { log } from "./commands/log";
import { Config } from "./config/config";
import { Store } from "./store/store";

const program = new Command("tag");
const config = new Config();
const store = new Store(homedir, config.getStoreFilename());

program
    .version(pkg.version);

program
    .command("add <tag> [categories...]")
    .description("Add that tag with some additional categories")
    .option("-d, --duration <hours>", "Duration spend on that tag", parseInt)
    .option("-a, --after <days>", "Shift that tag time d days after now", parseInt)
    .option("-b, --before <days>", "Shift that tag time d days before now", parseInt)
    .option("-m, --message <message>", "Tag associated message")
    .action(add(config, store));

program
    .command("list")
    .description("Print a list of all tags")
    .option("-s, --size <days>", "History size in days", parseInt)
    .option("-f, --future", "Print tags only used in the future")
    .option("-c, --compact", "Print the tags only")
    .action(list(config, store));

program
    .command("log")
    .description("Show a log of added tags")
    .option("-s, --size <days>", "History size in days", parseInt)
    .option("-f, --future", "Print tag in the future")
    .option("-c, --compact", "Print the tags only")
    .action(log(config, store));

program
    .parse(process.argv);
