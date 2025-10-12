import { defineConfig, UserConfig } from "tsdown";
import copy from "rollup-plugin-copy";
import { addNodeRequireShim } from "./internals";

//----------------------
// Functions
//----------------------

/** @internal */
export const BasicConfig = (isDev: boolean) =>
	({
		METAFILES_TO_COPY: {
			entry: ["src/index.ts"],
			plugins: [
				copy({
					targets: [
						{ src: "./package.json", dest: "./dist" },
						{ src: "./.npmrc", dest: "./dist" },
						{ src: "./.npmignore", dest: "./dist" },
						{ src: "./README.md", dest: "./dist" }
					]
				})
			]
		},
		PACKAGE: {
			entry: ["src/index.ts"],
			clean: false,
			outDir: "dist",
			target: "es2020",
			banner: addNodeRequireShim,
			dts: true,
			format: ["esm", "cjs"]
		}
	}) as const satisfies Record<string, UserConfig>;

/** @internal */
export const devConfigs = BasicConfig(true);

/** @internal */
export const prodConfigs = BasicConfig(false);
