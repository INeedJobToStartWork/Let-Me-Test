import { UserConfig } from "tsdown";
import { addNodeRequireShim, BuildMode, PROD_OPTIMIZE } from "./internals";

//----------------------
// Functions
//----------------------

/** @internal */
export const BasicConfig = (mode: BuildMode) =>
	({
		// METAFILES_TO_COPY: {
		// 	entry: ["index.ts"],
		// 	clean: true,

		// 	outDir: `${process.cwd()}/dist`,

		// 	plugins: [
		// 		copy({
		// 			targets: [
		// 				{ src: "./package.json", dest: "./dist" },
		// 				{ src: "./.npmrc", dest: "./dist" },
		// 				{ src: "./.npmignore", dest: "./dist" },
		// 				{ src: "./README.md", dest: "./dist" }
		// 			]
		// 		})
		// 	]
		// }
		CLI: {
			entry: `${process.cwd()}/src/bin/app.ts`,
			clean: true,
			outDir: `${process.cwd()}/dist/bin`,
			deps: {
				alwaysBundle: ["commander"]
			},
			dts: false,

			minify: true,
			...(mode === BuildMode.DEV ? {} : PROD_OPTIMIZE)
		},
		PACKAGE: {
			entry: [`${process.cwd()}/src/index.ts`],
			outDir: `${process.cwd()}/dist`,

			clean: false,
			target: "es2020",
			banner: addNodeRequireShim,
			dts: true,
			format: mode === BuildMode.DEV ? ["esm"] : ["esm", "cjs"],

			// tsdown's `copy` runs once after all formats are built. A copy plugin would run once per
			// format (esm + cjs) in parallel and race on the same files (EBUSY on Windows).
			copy: ["package.json", ".npmrc", ".npmignore", "README.md"].map(file => `${process.cwd()}/${file}`),
			// attw: !isDev,
			attw: mode === BuildMode.NPM,
			publint: mode === BuildMode.NPM,

			...(mode === BuildMode.DEV ? {} : PROD_OPTIMIZE)
		}
	}) as const satisfies Record<string, UserConfig>;

//----------------------
// CONSTANTS
//----------------------

/** @internal */
export const DEV_CONFIGS = BasicConfig(BuildMode.DEV);

/** @internal */
export const PROD_CONFIGS = BasicConfig(BuildMode.PROD);

/** @internal */
export const TEST_CONFIGS = BasicConfig(BuildMode.TEST);

/** @internal */
export const NPM_CONFIGS = BasicConfig(BuildMode.NPM);
