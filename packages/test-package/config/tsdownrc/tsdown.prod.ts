import { defineConfig } from "tsdown";
import { prodConfigs } from "./tsdown.base";
import { PROD_OPTIMIZE } from "./internals";

//----------------------
// Functions
//----------------------

export default defineConfig([
	{
		...prodConfigs.METAFILES_TO_COPY,
		clean: true
	},
	{
		...prodConfigs.PACKAGE,
		...PROD_OPTIMIZE,
		format: ["esm", "cjs"],
		dts: true
	}
]);
