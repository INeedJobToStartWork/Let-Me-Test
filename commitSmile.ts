import { defaultConfig } from "commitsmile";

export default defaultConfig().deepMerge({
  prompts: {
    scopes: {
      workspaces: true,
      options: [{ label: `🌍 Environment`, value: "environment" }],
      custom: true,
    },
    description: false,
  },
});
