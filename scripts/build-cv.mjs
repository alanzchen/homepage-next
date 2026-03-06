#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const cvDir = path.join(repoRoot, "cv");
const cvPdfPath = path.join(cvDir, "main.pdf");

function run(command, args, cwd = repoRoot) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function hasCommand(command) {
  const result = spawnSync("which", [command], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  return result.status === 0;
}

function main() {
  run("node", ["scripts/sync-cv.mjs"]);

  if (!hasCommand("latexmk")) {
    throw new Error("latexmk is not installed. Please install TeX Live/MacTeX to compile the CV PDF.");
  }

  run("latexmk", ["-pdf", "-interaction=nonstopmode", "-halt-on-error", "main.tex"], cvDir);

  if (!fs.existsSync(cvPdfPath)) {
    throw new Error(`Expected compiled PDF at ${cvPdfPath}`);
  }

  run("latexmk", ["-c"], cvDir);
  console.log(`Built ${cvPdfPath}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
