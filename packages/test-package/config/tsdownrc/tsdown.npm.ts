import { defineConfig } from "tsdown";
import { NPM_CONFIGS } from "./tsdown.base";

//----------------------
// Functions
//----------------------

export default defineConfig(Object.values(NPM_CONFIGS));
