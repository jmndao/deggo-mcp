#!/usr/bin/env node

/**
 * Automatic changelog generator
 * Generates changelog based on git commits and package.json version
 */

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const CHANGELOG_FILE = "CHANGELOG.md";

function getPackageVersion() {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  return packageJson.version;
}

function getGitCommitsSinceLastTag() {
  try {
    // Get last tag
    const lastTag = execSync("git describe --tags --abbrev=0", {
      encoding: "utf8",
    }).trim();
    console.log(`Last tag: ${lastTag}`);

    // Get commits since last tag
    const commits = execSync(`git log ${lastTag}..HEAD --oneline`, {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);

    return commits;
  } catch (error) {
    // No tags yet, get all commits
    console.log("No previous tags found, getting all commits");
    const commits = execSync("git log --oneline", { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);

    return commits;
  }
}

function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    docs: [],
    tests: [],
    chore: [],
    breaking: [],
  };

  commits.forEach((commit) => {
    const message = commit.toLowerCase();

    if (message.includes("breaking") || message.includes("!:")) {
      categories.breaking.push(commit);
    } else if (
      message.includes("feat") ||
      message.includes("add") ||
      message.includes("implement")
    ) {
      categories.features.push(commit);
    } else if (
      message.includes("fix") ||
      message.includes("bug") ||
      message.includes("resolve")
    ) {
      categories.fixes.push(commit);
    } else if (message.includes("doc") || message.includes("readme")) {
      categories.docs.push(commit);
    } else if (message.includes("test") || message.includes("spec")) {
      categories.tests.push(commit);
    } else {
      categories.chore.push(commit);
    }
  });

  return categories;
}

function formatCommit(commit) {
  // Remove hash and format commit message
  const [hash, ...messageParts] = commit.split(" ");
  const message = messageParts.join(" ");

  // Capitalize first letter
  const formatted = message.charAt(0).toUpperCase() + message.slice(1);

  return `- ${formatted} (${hash})`;
}

function generateChangelogEntry(version, categories) {
  const date = new Date().toISOString().split("T")[0];
  let entry = `## [${version}] - ${date}\n\n`;

  if (categories.breaking.length > 0) {
    entry += "### ⚠️ BREAKING CHANGES\n\n";
    categories.breaking.forEach((commit) => {
      entry += formatCommit(commit) + "\n";
    });
    entry += "\n";
  }

  if (categories.features.length > 0) {
    entry += "### ✨ Features\n\n";
    categories.features.forEach((commit) => {
      entry += formatCommit(commit) + "\n";
    });
    entry += "\n";
  }

  if (categories.fixes.length > 0) {
    entry += "### 🐛 Bug Fixes\n\n";
    categories.fixes.forEach((commit) => {
      entry += formatCommit(commit) + "\n";
    });
    entry += "\n";
  }

  if (categories.docs.length > 0) {
    entry += "### 📚 Documentation\n\n";
    categories.docs.forEach((commit) => {
      entry += formatCommit(commit) + "\n";
    });
    entry += "\n";
  }

  if (categories.tests.length > 0) {
    entry += "### 🧪 Tests\n\n";
    categories.tests.forEach((commit) => {
      entry += formatCommit(commit) + "\n";
    });
    entry += "\n";
  }

  if (categories.chore.length > 0) {
    entry += "### 🔧 Maintenance\n\n";
    categories.chore.forEach((commit) => {
      entry += formatCommit(commit) + "\n";
    });
    entry += "\n";
  }

  return entry;
}

function updateChangelog(newEntry) {
  let existingContent = "";

  if (fs.existsSync(CHANGELOG_FILE)) {
    existingContent = fs.readFileSync(CHANGELOG_FILE, "utf8");

    // Remove header if it exists, we'll add it back
    existingContent = existingContent.replace(/^# Changelog\n\n/, "");
  }

  const header = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

  const fullContent = header + newEntry + existingContent;

  fs.writeFileSync(CHANGELOG_FILE, fullContent);
  console.log(`✅ Updated ${CHANGELOG_FILE}`);
}

function main() {
  console.log("🚀 Generating changelog...");

  const version = getPackageVersion();
  console.log(`📦 Current version: ${version}`);

  const commits = getGitCommitsSinceLastTag();
  console.log(`📝 Found ${commits.length} commits since last release`);

  if (commits.length === 0) {
    console.log("ℹ️ No new commits found, changelog not updated");
    return;
  }

  const categories = categorizeCommits(commits);
  const entry = generateChangelogEntry(version, categories);

  updateChangelog(entry);

  console.log("✨ Changelog generated successfully!");
}

if (require.main === module) {
  main();
}
