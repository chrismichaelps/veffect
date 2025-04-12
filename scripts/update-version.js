#!/usr/bin/env node

/**
 * Script to update the package version
 * Usage: node scripts/update-version.js [patch|minor|major]
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get the version type from command line argument
const versionType = process.argv[2] || "patch";
const validTypes = ["patch", "minor", "major"];

if (!validTypes.includes(versionType)) {
  console.error(
    `Invalid version type: ${versionType}. Must be one of: ${validTypes.join(
      ", "
    )}`
  );
  process.exit(1);
}

// Read the current package.json
const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

// Get the current version
const currentVersion = packageJson.version;
console.log(`Current version: ${currentVersion}`);

// Update the version based on the specified type
let [major, minor, patch] = currentVersion.split(".").map(Number);

switch (versionType) {
  case "major":
    major++;
    minor = 0;
    patch = 0;
    break;
  case "minor":
    minor++;
    patch = 0;
    break;
  case "patch":
  default:
    patch++;
    break;
}

// Create the new version string
const newVersion = `${major}.${minor}.${patch}`;
console.log(`New version: ${newVersion}`);

// Update the package.json
packageJson.version = newVersion;

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

console.log("Package.json updated successfully");

// Clean and rebuild
try {
  console.log("Cleaning...");
  execSync("npm run clean", { stdio: "inherit" });

  console.log("Building...");
  execSync("npm run build", { stdio: "inherit" });

  console.log(`Successfully updated to version ${newVersion} and rebuilt`);
} catch (error) {
  console.error("Build failed:", error.message);
  process.exit(1);
}
