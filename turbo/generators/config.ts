import { execSync } from "child_process";
import { PlopTypes } from "@turbo/gen";

const getGitConfig = (key: string) => {
  try {
    return execSync(`git config --get ${key}`).toString().trim();
  } catch {
    return "";
  }
};

const getRepoName = () => {
  try {
    const remoteUrl = execSync("git remote get-url origin").toString().trim();
    const parts = remoteUrl.split("/");
    const repoPart = parts[parts.length - 1] || "";
    return repoPart.replace(".git", "") || "Let-me-test";
  } catch {
    return "Let-me-test";
  }
};

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setHelper("year", () => new Date().getFullYear());

  plop.setGenerator("Package", {
    description: "Generate a new Package + CLI",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the new package?",
        validate: (input: string) => {
          if (!input) return "package name is required";
          if (input.includes(" ")) return "package name cannot include spaces";
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "What is the description of the new package?",
      },
      {
        type: "input",
        name: "finalScope",
        message: "What is the final scope of the new package? (after build)",
        transform: (input: string) => {
          if (!input) return "";
          if (input.startsWith("@")) return input;
          return "@" + input;
        },
      },
      {
        type: "input",
        name: "githubOwner",
        message: "What is the GitHub owner/username?",
        default: getGitConfig("user.name") || "INeedJobToStartWork",
      },
      {
        type: "input",
        name: "githubRepo",
        message: "What is the GitHub repository name?",
        default: getRepoName(),
      },
      {
        type: "input",
        name: "gitAuthorName",
        message: "What is the Git author name?",
        default: (answers: any) => answers.githubOwner || "INEEDJ",
      },
    ],
    actions: (data: any) => {
      const root = data.turbo?.paths?.root || ".";
      return [
        {
          type: "addMany",
          destination: `${root}/packages/{{ dashCase name }}`,
          base: "templates/packages/test-package-cli",
          templateFiles: "templates/packages/test-package-cli/**",
          globOptions: { dot: true, ignore: ["**/node_modules/**"] },
        },
      ];
    },
  });

  plop.setGenerator("REPO customization", {
    description:
      "Update or generate root configuration files (GitHub, LICENSE, README, package.json)",
    prompts: [
      {
        type: "input",
        name: "githubOwner",
        message: "What is the GitHub owner/username?",
        default: getGitConfig("user.name") || "INeedJobToStartWork",
      },
      {
        type: "input",
        name: "githubEmail",
        message: "What is the GitHub email?",
        default: getGitConfig("user.email") || "ineedjobtostartwork@gmail.com",
      },
      {
        type: "input",
        name: "githubRepo",
        message: "What is the GitHub repository name?",
        default: getRepoName(),
      },
      {
        type: "input",
        name: "gitAuthorName",
        message: "What is the Git author name?",
        default: (answers: any) => answers.githubOwner || "INEEDJ",
      },
    ],
    actions: (data: any) => {
      const root =
        data.turbo?.paths?.root && data.turbo.paths.root !== ""
          ? data.turbo.paths.root
          : ".";

      return [
        {
          type: "addMany",
          destination: root,
          base: "templates",
          templateFiles: "templates/.github/**",
          globOptions: { dot: true },
          force: true,
        },
        {
          type: "add",
          path: `${root}/LICENSE`,
          templateFile: "templates/packages/test-package-cli/LICENSE",
          force: true,
        },
        {
          type: "add",
          path: `${root}/README.md`,
          templateFile: "templates/packages/test-package-cli/README.md",
          force: true,
        },
        {
          type: "modify",
          path: `${root}/package.json`,
          transform: (content: string, answers: any) => {
            try {
              const pkg = JSON.parse(content);
              pkg.name = `@monorepo/${answers.name}`;
              pkg.repository = {
                type: "git",
                url: `git+https://github.com/${answers.githubOwner}/${answers.githubRepo}.git`,
              };
              pkg.author = answers.gitAuthorName;
              pkg.bugs = {
                url: `https://github.com/${answers.githubOwner}/${answers.githubRepo}/issues`,
              };
              pkg.homepage = `https://github.com/${answers.githubOwner}/${answers.githubRepo}#readme`;
              return JSON.stringify(pkg, null, 2);
            } catch (e) {
              return content;
            }
          },
        },
      ];
    },
  });
}
