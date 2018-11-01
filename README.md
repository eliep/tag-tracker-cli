# Tag Tracker
[![Build Status](https://travis-ci.org/eliep/tag-tracker-cli.svg?branch=master)](https://travis-ci.org/eliep/tag-tracker-cli)

Tag is still under development and most commands might change in the future.

## Installation
```bash
$ npm install -g tag-tracker-cli
$ tag --help
```

### Bash Autocompletion
```bash
$ sudo cp $(dirname $(readlink -f $(which tag)))/../complete/tag-completion.bash /etc/bash_completion.d/tag
$ . /etc/bash_completion.d/tag # the first time
```

## Documentation
[Online documentation](https://eliep.github.io/tag-tracker-cli/) is still under writing process, 
but help is available via
```bash
tag --help
```

## Dev
Require nodejs version >= 10

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

## License
This project is licensed under the terms of the MIT license.

