userscript-meta-cli
===================

[![Build Status](https://travis-ci.org/eight04/userscript-meta-cli.svg?branch=master)](https://travis-ci.org/eight04/userscript-meta-cli)

A CLI build tool for userscript metadata block

Features
--------
* Build metadata block with information inside package.json.
* Merge multiple metadata files.
* Update metablock inside userscripts.

Install
-------
```
npm install -D userscript-meta-cli
```

Usage
-----
```
usage:
  userscript-meta [--no-package] [--read=<file>...] [--update=<file>]
                  [--output=<file>] [--json]
  
options:
  -n --no-package Don't extract data from package.json
  
  -r --read       Read metadata from files. Support json or any text file
                  containing userscript metadata block.
				  
  -u --update     Update the metadata block in the file, instead of writing to
                  output.
				  
  -o --output     Write output meta block to file. If not provided, writing to
                  stdout.
				  
  --json          Output json format.
				  
  -v --version    Print version number.
  -h --help       Print help screen.
```

Reconized fields in package.json
--------------------------------
* name
* title - an alias of name
* version
* description
* homepage - homepageURL
* bugs - supportURL
* license
* author
* contributors - contributor
* repository - if homepage is missing and repository is provided, it will try to guess homepageURL according to this field.
* engines - compatible

Other fields like `include`, `exclude`, etc, could be set in `userscript` field.
```json
{
	"userscript": {
		"include": ["http://example.com/*", "http://example2.com/*"]
	}
}
```
The metadata defined in `userscript` would overwrite the fields in package.json root.

API
----

### getMeta

```js
const metaObject = getMeta({
  findPackage?: Boolean,
  readFiles?: Array<String>
});
```

If `findPackage` is `true` then extract metadata from `package.json`. Default: `true`.

`readFiles` is an array of filenames.

### stringify

The `stringify` method of [userscript-meta](https://www.npmjs.com/package/userscript-meta).

### parse

The `parse` method of [userscript-meta](https://www.npmjs.com/package/userscript-meta).

Todos
-----
* Integrate [browserslist](https://www.npmjs.com/package/browserslist) with compatible field.

Changelog
---------
* 0.3.0 (Mar 16, 2018)
	- Add: `@include *` when there is no include/match rule is found.
	- Add: a better way to find `package.json`. Now the tool would read `package.json` file from the parent/ancestor folder.
* 0.2.0 (Jul 29, 2017)
	- Add: generate `supportURL` from `repository`.
	- Add: warning message to `--update` help screen.
	- Fix: new line issue with `--update`.
	- Fix: doesn't work under linux due to CRLF issue.
* 0.1.0 (Mar 19, 2017)
	- First release.
