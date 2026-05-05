import { defineConfig } from "tsdown";
import { DEV_CONFIGS } from "./tsdown.base";

//----------------------
// Functions
//----------------------

export default defineConfig(Object.values(DEV_CONFIGS));
// export default defineConfig(devConfigs.PACKAGE);
