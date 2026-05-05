import { Option } from "commander";
import * as path from "node:path";

//----------------------
// Types
//----------------------

/** @internal @dontexport */
export interface IOptionsConfig {
	config: string;
}

//----------------------
// Helper
//----------------------

const EXECUTED_PATH = path.join(path.resolve());

/** @internal @dontexport */
export const optionConfig = new Option("-C, --config <relativePath>", "path to config").default(EXECUTED_PATH);

export default optionConfig;
