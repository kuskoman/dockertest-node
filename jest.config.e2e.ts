import defaultConfig from "./jest.config";
import { Config } from "@jest/types";

const e2eConfig: Config.InitialOptions = {
    ...defaultConfig,
    setupFiles: ["<rootDir>/test/environment.ts"],
    roots: ["<rootDir>/test"],
    testRegex: [".e2e-spec.ts$", ".integration-spec.ts$"],
};

export default e2eConfig;
