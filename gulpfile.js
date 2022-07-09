import {cp} from "node:fs/promises";
import del from "del";
import {execa} from "execa";
import gulp from "gulp";
import config from "./jsconfig.json" assert {type: "json"};
import pkg from "./package.json" assert {type: "json"};

/** Builds the project. */
export async function build() {
	await cp("node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff2", "www/fonts/bootstrap_icons.woff2");
	await exec("sass", ["--load-path=node_modules", "--no-source-map", "src/ui:www/css"]);
	await exec("cleancss", ["-O2", "--output=www/css/mc2it.css", "www/css/mc2it.css"]);
	return exec("tsc", ["--project", "src/jsconfig.json"]);
}

/** Deletes all generated files and reset any saved state. */
export function clean() {
	return del(["src", "var/**/*", "www/css"]);
}

/** Builds the documentation. */
export async function doc() {
	await exec("typedoc", ["--options", "etc/typedoc.json"]);
	return cp("www/favicon.ico", "docs/favicon.ico");
}

/** Performs the static analysis of source code. */
export async function lint() {
	await exec("eslint", ["--config=etc/eslint.json", ...config.include]);
	return exec("tsc", ["--project", "jsconfig.json"]);
}

/** Publishes the package in the registry. */
export async function publish() {
	for (const registry of ["https://registry.npmjs.org", "https://npm.pkg.github.com"]) await exec("npm", ["publish", `--registry=${registry}`]);
	for (const command of [["tag"], ["push", "origin"]]) await exec("git", [...command, `v${pkg.version}`]);
}

/** Watches for file changes. */
export function watch() {
	return exec("sass", ["--load-path=node_modules", "--no-source-map", "--watch", "src/ui:www/css"]);
}

/** Runs the default task. */
export default gulp.series(
	clean,
	build
);

/**
 * Runs the specified command.
 * @param {string} command The command to run.
 * @param {string[]} [args] The command arguments.
 * @param {import("execa").Options} [options] The child process options.
 * @returns {import("execa").ExecaChildProcess} Resolves when the command is finally terminated.
 */
function exec(command, args = [], options = {}) {
	return execa(command, args, {preferLocal: true, stdio: "inherit", ...options});
}
