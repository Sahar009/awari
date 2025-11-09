import loadConfigModule from "next/dist/server/config.js";
import { PHASE_PRODUCTION_BUILD } from "next/constants.js";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");

const loadConfig =
  typeof loadConfigModule === "function"
    ? loadConfigModule
    : loadConfigModule.default;

const config = await loadConfig(PHASE_PRODUCTION_BUILD, projectDir);
const rawConfig = await loadConfig(PHASE_PRODUCTION_BUILD, projectDir, {
  rawConfig: true
});

console.log("Config keys:", Object.keys(config));
console.log("generateBuildId type:", typeof config.generateBuildId);
console.log("generateBuildId value:", config.generateBuildId);
console.log("generateBuildId in config:", "generateBuildId" in config);
console.log("Raw config keys:", Object.keys(rawConfig || {}));
console.log(
  "Raw generateBuildId type:",
  rawConfig ? typeof rawConfig.generateBuildId : "n/a"
);

