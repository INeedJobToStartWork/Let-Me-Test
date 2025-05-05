import type { IOptionsConfig, IOptionsDebugger } from "@/helpers";
import { optionConfig, optionDebugger } from "@/helpers";
import { program } from "commander";

//----------------------
// Types
//----------------------

interface IOptionParams extends IOptionsDebugger, IOptionsConfig {
	input?: string;
	output?: string;
}

//----------------------
// CLI APP
//----------------------

program
	.description("Execute Let-me-test application")
	.argument("<input>")
	.argument("[output]")
	.addOption(optionConfig)
	.addOption(optionDebugger)
	.action((arg1, arg2, paramsInput: IOptionParams) => {
		console.log(arg1, arg2, paramsInput);
	});
