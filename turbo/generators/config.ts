import { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
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
        name: "finalScope",
        message:
          "What is the final scope of the new package? (after build) (can be empty)",
        validate: (input: string) => {
          if (input.includes(" ")) {
            return "scope cannot include spaces";
          }
          return true;
        },
        transform: (input: string) => {
          if (input.startsWith("@")) return input;
          return "@" + input;
        },
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: "{{ turbo.paths.root }}/packages/{{ dashCase name }}",
        base: "templates/packages/test-package-cli",
        templateFiles: "templates/packages/test-package-cli/**",
        globOptions: { dot: true, ignore: ["**/node_modules/**"] },
      },
    ],
  });

  // plop.setGenerator("example", {
  //   description:
  //     "An example Turborepo generator - creates a new file at the root of the project",
  //   prompts: [
  //     {
  //       type: "input",
  //       name: "file",
  //       message: "What is the name of the new file to create?",
  //       validate: (input: string) => {
  //         if (input.includes(".")) {
  //           return "file name cannot include an extension";
  //         }
  //         if (input.includes(" ")) {
  //           return "file name cannot include spaces";
  //         }
  //         if (!input) {
  //           return "file name is required";
  //         }
  //         return true;
  //       },
  //     },
  //     {
  //       type: "list",
  //       name: "type",
  //       message: "What type of file should be created?",
  //       choices: [".md", ".txt"],
  //     },
  //     {
  //       type: "input",
  //       name: "title",
  //       message: "What should be the title of the new file?",
  //     },
  //   ],
  //   actions: [
  //     {
  //       type: "add",
  //       path: "{{ turbo.paths.root }}/{{ dashCase file }}{{ type }}",
  //       templateFile: "templates/turborepo-generators.hbs",
  //     },
  //   ],
  // });
}
