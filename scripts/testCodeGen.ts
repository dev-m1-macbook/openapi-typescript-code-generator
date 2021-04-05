import * as fs from "fs";

import { CodeGenerator, DefaultCodeTemplate } from "../lib";

const gen = (name: string, enableValidate = true): void => {
  fs.mkdirSync("test/code", { recursive: true });
  const codeGenerator = new CodeGenerator(`test/${name}/index.yml`);
  // codeGenerator.validate();
  const code = codeGenerator.generateTypeDefinition<DefaultCodeTemplate.Option>({
    generator: DefaultCodeTemplate.makeApiClient,
    option: {
      sync: false,
    },
  });
  if (enableValidate) {
    codeGenerator.validate({
      logger: { displayLogLines: 1 },
    });
  }
  fs.writeFileSync(`test/code/${name}.ts`, code, { encoding: "utf-8" });
  console.log(`Generate Code : test/code/${name}.ts`);
};

const genSyncMode = (name: string, enableValidate = true): void => {
  const codeGenerator = new CodeGenerator(`test/${name}/index.yml`);
  fs.mkdirSync("test/code", { recursive: true });
  if (enableValidate) {
    codeGenerator.validate({
      logger: { displayLogLines: 1 },
    });
  }
  const code = codeGenerator.generateTypeDefinition<DefaultCodeTemplate.Option>({
    generator: DefaultCodeTemplate.makeApiClient,
    option: {
      sync: true,
    },
  });
  fs.writeFileSync(`test/code/sync-${name}.ts`, code, { encoding: "utf-8" });
  console.log(`Generate Code : test/code/sync-${name}.ts`);
};

const main = () => {
  gen("api.test.domain");
  gen("infer.domain", false);
  genSyncMode("api.test.domain");
};

main();
