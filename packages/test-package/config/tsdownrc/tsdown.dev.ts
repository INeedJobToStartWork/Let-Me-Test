import { defineConfig } from "tsdown";
import { devConfigs } from "./tsdown.base";

//----------------------
// Functions
//----------------------

export default defineConfig(Object.values(devConfigs));
