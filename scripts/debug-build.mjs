import nextBuildModule from "next/dist/build/index.js";
import path from "path";
import url from "url";

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  console.error(error?.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  if (reason instanceof Error) {
    console.error(reason.stack);
  }
  process.exit(1);
});

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");

const nextBuild =
  typeof nextBuildModule === "function"
    ? nextBuildModule
    : nextBuildModule.default;

try {
  await nextBuild(projectDir);
  console.log("Build completed successfully");
} catch (error) {
  console.error("Build failed:", error);
  if (error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}


