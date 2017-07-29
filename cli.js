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

var {packageToMeta, fileToMeta, METADATA_BLOCK_REGEX} = require("./index"),
	userscriptMeta = require("userscript-meta"),
	fs = require("fs-extra");

var meta = {};
if (!args["--no-package"]) {
	Object.assign(meta, packageToMeta());
}
if (args["--read"]) {
	for (var file of args["--read"]) {
		if (file.endsWith(".json")) {
			Object.assign(meta, require(file));
		} else {
			Object.assign(meta, fileToMeta(file));
		}
	}
}
if (!meta.grant) {
	meta.grant = "none";
}
if (args["--update"]) {
	updateFile(args["--update"], meta);
} else {
	var out = args["--json"] ? JSON.stringify(meta, null, 2) : userscriptMeta.stringify(meta);
	if (args["--output"]) {
		fs.outputFileSync(args["--output"], out);
	} else {
		process.stdout.write(out);
	}
}

function updateFile(file, meta) {
	var text = fs.readFileSync(file, "utf8"),	
		match = text.match(METADATA_BLOCK_REGEX),
		out = text.slice(0, match.index) + userscriptMeta.stringify(meta) + text.slice(match.index + match[0].length);
		
	fs.outputFileSync(file, out, "utf8");
}
