const fs = require("fs-extra");
const userscriptMeta = require("userscript-meta");
const path = require("path");

function packageToMeta(pkg) {
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
		if (typeof pkg.repository == "string") {
			target.homepageURL = repositoryToHomepage(pkg.repository);
		} else if (pkg.repository.url) {
			target.homepageURL = pkg.repository.url;
		}
	}
	var support;
	if (typeof pkg.repository == "string" && !target.supportURL && (support = repositoryToSupport(pkg.repository))) {
		target.supportURL = support;
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

function packageFileToMeta(file) {
	const pkg = JSON.parse(fs.readFileSync(file));
	return packageToMeta(pkg);
}

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
	var match = repository.match(/^(?:(gist|bitbucket|gitlab):)?(.+)/);
	return REPOS[match[1] || "github"] + match[2];
}

function repositoryToSupport(repository) {
	// no issues for gist
	if (repository.startsWith("gist:")) {
		return null;
	}
	return repositoryToHomepage(repository) + "/issues";
}

var METADATA_BLOCK_REGEX = /\/\/ ==UserScript==[^]+?\/\/ ==\/UserScript==/i;
exports.METADATA_BLOCK_REGEX = METADATA_BLOCK_REGEX;

function fileToMeta(file) {
	var text = fs.readFileSync(file, "utf8"),
		match = text.match(METADATA_BLOCK_REGEX);
	if (!match) {
		throw new Error(`Can't find metadata block from ${file}`);
	}
	return userscriptMeta.parse(match[0]);
}
exports.fileToMeta = fileToMeta;

function isFile(file) {
	try {
		fs.accessSync(file);
	} catch (err) {
		return false;
	}
	return true;
}

function findPackagePath() {
	let dir = path.resolve();
	while (!isFile(path.join(dir, "package.json"))) {
		const parentDir = path.dirname(dir);
		if (parentDir == dir) {
			throw new Error("Cannot find package.json");
		}
		dir = parentDir;
	}
	return path.join(dir, "package.json");
}
exports.findPackagePath = findPackagePath;

function init(args) {
  const meta = getMeta({
    findPackage: !args["--no-package"],
    readFiles: args["--read"]
  });
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
			out = text.slice(0, match.index) + userscriptMeta.stringify(meta).trim() + text.slice(match.index + match[0].length);
			
		fs.outputFileSync(file, out, "utf8");
	}
}
exports.init = init;

function getMeta({findPackage = true, readFiles = []} = {}) {
  const meta = {};
  if (findPackage) {
    Object.assign(meta, packageFileToMeta(findPackagePath()));
  }
  for (const file of readFiles) {
    let newMeta;
    if (file.endsWith("package.json")) {
      newMeta = packageFileToMeta(file);
    } else if (file.endsWith(".json")) {
      newMeta = JSON.parse(fs.readFileSync(file));
    } else {
      newMeta = fileToMeta(file);
    }
    Object.assign(meta, newMeta);
  }
	if (!meta.grant) {
		meta.grant = "none";
	}
	if (noMatchPattern(meta)) {
		meta.include = "*";
	}
  return meta;
  
	function noMatchPattern(meta) {
		return (!meta.include || Array.isArray(meta.include) && !meta.include.length) &&
			(!meta.match || Array.isArray(meta.match) && !meta.match.length)
	}
}
exports.getMeta = getMeta;

exports.parse = userscriptMeta.parse;
exports.stringify = userscriptMeta.stringify;
