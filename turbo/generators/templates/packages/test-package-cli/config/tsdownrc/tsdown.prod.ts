import { defineConfig } from "tsdown";
import { PROD_CONFIGS } from "./tsdown.base";

//----------------------
// Functions
//----------------------

export default defineConfig(Object.values(PROD_CONFIGS));
