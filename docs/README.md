---
title: Tag Documentation
lang: en-US
meta:
  - name: description
    content: tag-tracker-cli project documentation
  - name: keywords
    content: tag time tracker cli
---

```
   _    _
  | |  | |_ __ _  __ _
 / __) | __/ _` |/ _` |
 \__ \ | || (_| | (_| |
 (   /  \__\__,_|\__, |  _____
  |_|            |___/  |_____|

```

# Documentation
The `tag` command allows you to keep track of your daily work and pleasure by quickly adding tags
through your days. A tag can be anything you like, although we recommend to keep them short and 
opinionated given your tracking objectives.

Tag is not a time tracker per se as it doesn't record the precise duration
spent on a task. However you will still be able to record a given amount of time with each tag you add.


## Installation
`tag` can be installed either via `npm` or by cloning the github repository (packaged version of 
tag are still under development). Both alternatives require a Node.js version >= 10.

::: warning
Require Node.js version >= 10
::: 

### npm install

```bash
$ npm install -g tag-tracker-cli
$ tag --help
```

#### Bash Completion
```bash
$ sudo cp $(dirname $(readlink -f $(which tag)))/../complete/tag-completion.bash \
          /etc/bash_completion.d/tag
$ . /etc/bash_completion.d/tag # only the first time
```

### git clone
Installation can be done by cloning the [github repository](https://github.com/eliep/tag-tracker-cli). 
See [Development > Setup](#setup) section for details.

## Usage

### help
The `--help` option is available for the `tag` command (which list the subcommands), 
and for each subcommand, listing their available options:

```bash
$ tag --help
$ tag add --help
$ tag log --help
$ tag list --help
```

### add
```bash
tag add [options] <tag> [categories...]
```

`tag add` allows you to add a given tag, for example 
`$ tag add some-work` says that you did *some-work* today.

You can enrich this tag addition with more context: 
* **duration**: `tag` doesn't record the time you spent on each tag but you can give a duration
with the `--duration` (`-d`) option. For example 

   `$ tag add some-work --duration 4` says that you spent 4 units of time doing *some-work*.
   
* **date**: by default, `tag` affects the today date to the tag addition. You can change this behavior with
the `--before` (`-b`) or `--after` (`-a`) options; both options shifting the date by a given number of day
For example:

    `$ tag add some-work --before 1` says that you did *some-work* *yesterday*
    
    `$ tag add some-work --after 2` says that you will do *some-work* in *two days*

* **categories**: depending on what you're tracking, tag alone may not be enough. 
In `tag`, categories will help you to keep track of any subject matter related to your tags.
A category is simply defined by its name and can be associated with a value any time you add a tag. 
For example:

   `$ tag add some-work project:tag` says that you did *some-work*, flagged *tag* in the *project* 
   category.
 
* **message**: if you want to add a detailled message along with the tag, use the `--message` (`-m`)
option. For example 

   `$ tag add some-work --message "working on documentation"` says that you did *some-work* 
   *working on documentation*

Altogether:

`$ tag add some-work -d 4 -b 1 -m "working on documentation" project:tag` says you did *some-work*
*working on documentation* *yesterday*, flagged *tag* in the *project* category.


### log
```bash
tag log [options]
```

`tag log` outputs a log of all tag additions with the tag, duration, date, category and message 
information. Options are:

* **size**: by default, only tag additions within the last 30 days are considered. 
This can be changed by specifying the `--size` (`-s`) option:

   `$ tag log --size 10` log all tag additions within the last 10 days.
   
* **future**: by default, tag additions in the future are not listed unless the `--future` (`-f`) option
is specified:

    `$ tag log -f` log all tag additions within the last 30 days along with those in the future.
    
* **compact**: the `--compact` (`-c`) option displays a compacted log where addition of the same tag 
the same day are merged and messages are dropped.

   `tag log -c`

### list
```bash
tag list [options]
```

`tag list` outputs a list of all tags with the duration spent on each one and the last date that tag
was added. Options are: 

* **size**: by default, only tags added within the last 30 days are considered. 
This can be changed by specifying the `--size` (`-s`) option:

   `$ tag list --size 10` list all tags added within the last 10 days.
   
* **future**: by default, tags added in the future are not listed unless the `--future` (`-f`) option
is specified:

    `$ tag list -f` list all tags added within the last 30 days along with those in the future.
    
* **compact**: the `--compact` (`-c`) option displays a compacted list made of the tag only 
(no duration or date information).

   `tag list -c`

## Development

::: warning
Require Node.js version >= 10
:::

### Setup
```bash
$ git clone git@github.com:eliep/tag-tracker-cli.git
$ cd tag-tracker-cli
$ npm install .
$ npm run build
$ sudo npm link
```

### Documentation
```bash
$ npm run docs:dev
$ xdg-open http://localhost:8080/tag-tracker-cli/
```


