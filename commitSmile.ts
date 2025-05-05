import { defaultConfig } from "commitsmile";

export default defaultConfig().deepMerge({
  prompts: {
    scopes: {
      workspaces: true,
      options: [{ label: `🌍 Enviroment`, value: "enviroment" }],
      custom: true,
    },
    description: false,
  },
});
