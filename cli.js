#!/usr/bin/env node

var neodoc = require("neodoc");

var args = neodoc.run(`Build userscript's meta from package.json file.

usage:
  userscript-meta [--no-package] [--read=<file>...] [--update=<file>]
                  [--output=<file>] [--json]

options:
  -n --no-package Don't extract data from package.json

  -r --read       Read metadata from files. Support json or any text file
                  containing userscript metadata block.

  -u --update     Update the metadata block in the file, instead of writing to
                  output. WARNING: If you want to preserved the original
                  metas, please -read the file first.

  -o --output     Write output meta block to file. If not provided, writing to
                  stdout.

  --json          Output json format.

  -v --version    Print version number.
  -h --help       Print help screen.
`);

require(".").init(args);
