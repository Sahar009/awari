import nextBuildModule from "next/dist/build/index.js";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");

const nextBuild =
  typeof nextBuildModule === "function"
    ? nextBuildModule
    : nextBuildModule.default;

if (!process.env.NEXT_BUILD_ID) {
  process.env.NEXT_BUILD_ID = Date.now().toString(36);
}

try {
  await nextBuild(projectDir);
  console.log("Next.js build completed successfully");
} catch (error) {
  console.error("Next.js build failed:", error);
  if (error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}

