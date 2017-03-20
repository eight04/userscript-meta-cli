userscript-meta-cli
===================
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
```
{
	"userscript": {
		"include": ["http://example.com/*", "http://example2.com/*"]
	}
}
```
The metadata defined in `userscript` would overwrite the fields in package.json root.

Todos
-----
* Integrate [browserslist](https://www.npmjs.com/package/browserslist) with compatible field.

Changelog
---------
* 0.1.0 (Mar 19, 2017)
	- First release.
