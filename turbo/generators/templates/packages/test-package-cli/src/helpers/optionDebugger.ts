import { Option } from "commander";

//----------------------
// Types
//----------------------

/** @internal @dontexport */
export interface IOptionsDebugger {
	debugger: boolean;
}

//----------------------
// Helper
//----------------------

/** @internal @dontexport */
export const optionDebugger = new Option("-D, --debug", "debug mode").default(false);

export default optionDebugger;
