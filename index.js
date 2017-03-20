function packageToMeta(pkg = require(process.cwd() + "/package.json")) {
	var target = {};
	if (pkg.name) {
		target.name = pkg.name;
	}
	if (pkg.title) {
		target.name = pkg.title;
	}
	if (pkg.version) {
		target.version = pkg.version;
	}
	if (pkg.description) {
		target.description = pkg.description;
	}
	if (pkg.homepage) {
		target.homepageURL = pkg.homepage;
	}
	if (pkg.bugs) {
		if (typeof pkg.bugs == "string") {
			target.supportURL = pkg.bugs;
		} else if (pkg.bugs.url) {
			target.supportURL = pkg.bugs.url;
		}
	}
	if (pkg.license) {
		target.license = pkg.license;
	}
	if (pkg.author) {
		target.author = personToString(pkg.author);
	}
	if (pkg.contributors) {
		target.contributor = [];
		for (var contributor of pkg.contributors) {
			target.contributor.push(personToString(contributor));
		}
	}
	if (pkg.repository && !target.homepageURL) {
		target.homepageURL = repositoryToHomepage(pkg.repository);
	}
	if (pkg.engines) {
		target.compatible = [];
		for (var [key, value] of Object.entries(pkg.engines)) {
			if (/firefox|chrome|opera|safari/i.test(key)) {
				target.compatible.push(`${key} ${value}`);
			}
		}
	}
	if (pkg.userscript) {
		Object.assign(target, pkg.userscript);
	}
	return target;
}
exports.packageToMeta = packageToMeta;

function personToString(people) {
	if (typeof people == "string") {
		return people;
	}
	var out = people.name;
	if (people.email) {
		out += ` <${people.email}>`;
	}
	if (people.url) {
		out += ` (${people.url})`;
	}
	return out;
}

var REPOS = {
	github: "https://github.com/",
	gist: "https://gist.github.com/",
	bitbucket: "https://bitbucket.org/",
	gitlab: "https://gitlab.com/"
};

function repositoryToHomepage(repository) {
	if (typeof repository == "string") {
		var match
		if ((match = repository.match(/^(?:(gist|bitbucket|gitlab):)?(.+)/))) {
			return REPOS[match[1] || "github"] + match[2];
		}
	} else {
		return repository.url;
	}
}

var METADATA_BLOCK_REGEX = /\/\/ ==UserScript==[^]+?\/\/ ==\/UserScript==/i;
exports.METADATA_BLOCK_REGEX = METADATA_BLOCK_REGEX;

var fs = require("fs"),
	userscriptMeta = require("userscript-meta");

function fileToMeta(file) {
	var text = fs.readFileSync(file, "utf8"),
		match = text.match(METADATA_BLOCK_REGEX);
	if (!match) {
		throw new Error(`Can't find metadata block from ${file}`);
	}
	return userscriptMeta.parse(match[0]);
}
exports.fileToMeta = fileToMeta;
