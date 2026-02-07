import { build as viteBuild } from "vite";
import { rm, cp } from "fs/promises";

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild({
    base: "./",
    build: {
      outDir: "../dist",
    },
  });

  console.log("build complete! output is in dist/");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
