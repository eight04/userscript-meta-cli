var {describe, it} = require("mocha"),
	proxyquire = require("proxyquire"),
	sinon = require("sinon"),
	assert = require("assert");
	
var fsStub = {},
	{packageToMeta, fileToMeta} = proxyquire("../index", {"fs": fsStub});
	
describe("packageToMeta", () => {
	var ptm = packageToMeta;
	
	it("basic", () => {
		for (var key of ["name", "version", "description", "license"]) {
			assert.deepEqual(ptm({[key]: "a"}), {[key]: "a"});
		}
	});
	
	it("name", () => {
		// title alias
		assert.deepEqual(ptm({title: "a"}), {name: "a"});
		// title should overwrite name
		assert.deepEqual(ptm({name: "a", title: "b"}), {name: "b"});
	});
	
	it("homepageURL", () => {
		// homepage
		assert.deepEqual(ptm({homepage: "a"}), {homepageURL: "a"});
		// repository github
		assert.deepEqual(
			ptm({repository: "a/b"}),
			{homepageURL: "https://github.com/a/b"}
		);
		// gist
		assert.deepEqual(
			ptm({repository: "gist:a"}),
			{homepageURL: "https://gist.github.com/a"}
		);
		// bitbucket
		assert.deepEqual(
			ptm({repository: "bitbucket:a/b"}),
			{homepageURL: "https://bitbucket.org/a/b"}
		);
		// gitlab
		assert.deepEqual(
			ptm({repository: "gitlab:a/b"}),
			{homepageURL: "https://gitlab.com/a/b"}
		);
		// other svn
		assert.deepEqual(
			ptm({repository: {type: "a", url: "b"}}),
			{homepageURL: "b"}
		);
		// homepage should overwrite repository
		assert.deepEqual(
			ptm({repository: {type: "a", url: "b"}, homepage: "c"}),
			{homepageURL: "c"}
		);
	});
	
	it("supportURL", () => {
		assert.deepEqual(
			ptm({bugs: {url: "a"}}),
			{supportURL: "a"}
		);
	});
	
	it("people", () => {
		assert.deepEqual(
			ptm({author: "a"}),
			{author: "a"}
		);
		// object
		assert.deepEqual(
			ptm({author: {name: "a", email: "b", url: "c"}}),
			{author: "a <b> (c)"}
		);
		// contributors
		assert.deepEqual(
			ptm({contributors: ["a", "b"]}),
			{contributor: ["a", "b"]}
		);
	});
	
	it("compatible", () => {
		assert.deepEqual(
			ptm({engines: {firefox: ">=48"}}),
			{compatible: ["firefox >=48"]}
		);
		// only accept firefox, chrome, opera, safari
		assert.deepEqual(
			ptm({engines: {
				firefox: "a",
				opera: "b",
				chrome: "c",
				safari: "d",
				node: "e",
				npm: "f"
			}}),
			{compatible: [
				"firefox a",
				"opera b",
				"chrome c",
				"safari d"
			]}
		);
	});
	
	it("userscript", () => {
		assert.deepEqual(
			ptm({name: "a", userscript: {name: "b"}}),
				{name: "b"}
		);
	});
});

describe("fileToMeta", () => {
	it("metadata block", () => {
		fsStub.readFileSync = sinon.spy(() => `
			// ==UserScript==
			// @name a
			// @author b
			// @include c
			// @include d
			// ==/UserScript==

			// script body...`
		);
		assert.deepEqual(
			fileToMeta("a.js"),
			{name: "a", author: "b", include: ["c", "d"]}
		);
		assert.equal(fsStub.readFileSync.firstCall.args[0], "a.js");
	});
});
