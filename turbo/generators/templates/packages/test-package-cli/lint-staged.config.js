//----------------------
// Helpers
//----------------------

/** Package root. lint-staged runs tasks from the repo root when it finds only one config, so commands are pinned here. */
const PACKAGE_DIR = import.meta.dirname.replaceAll("\\", "/");

/** @param {string} command */
const inPackage = command => (/** @type {string[]} */ files) =>
	`pnpm --dir "${PACKAGE_DIR}" exec ${command} ${files.map(file => `"${file}"`).join(" ")}`;

//----------------------
// Config
//----------------------

export default {
	"*.{ts,tsx,js,mjs,cjs}": [inPackage("eslint --fix --no-warn-ignored"), inPackage("prettier --write")],
	"*.{json,md,yml,yaml}": inPackage("prettier --write")
};
