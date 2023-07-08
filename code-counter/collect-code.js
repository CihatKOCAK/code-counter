const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const { config } = require("./config");

const octokit = new Octokit();
console.log("Collecting code...");
const username = config.userName;

async function collectCode() {
  let totalLinesOfCode = 0;

  const { data: repositories } = await octokit.repos.listForUser({
    username: username,
  });

  for (const repo of repositories) {
    console.log(`Collecting code from ${repo.name}`);

    try {
      const linesOfCode = await getLinesOfCodeInRepo(username, repo.name);
      totalLinesOfCode += linesOfCode;
    } catch (error) {
      if (error.status === 403) {
        console.error("API rate limit exceeded. Please wait and try again later.");
        return;
      } else {
        console.error(`Error collecting code from ${repo.name}:`, error);
      }
      continue;
    }
  }

  console.log(`Total lines of code: ${totalLinesOfCode}`);

  updateReadme(totalLinesOfCode);
}

async function getLinesOfCodeInRepo(owner, repo) {
  let linesOfCode = 0;
  let stack = [""];
  let currentDir = "";

  while (stack.length > 0) {
    const dir = stack.pop();
    const { data: contents } = await octokit.repos.getContent({
      owner: owner,
      repo: repo,
      path: dir,
    });

    for (const file of contents) {
      if (file.type === "dir") {
        stack.push(`${dir}${file.name}/`);
      } else if (file.type === "file" && isCodeFile(file.name)) {
        const { data: fileContent } = await octokit.repos.getContent({
          owner: owner,
          repo: repo,
          path: file.path,
        });
        const content = Buffer.from(fileContent.content, "base64").toString("utf-8");
        const fileLinesOfCode = countLinesOfCode(content);
        linesOfCode += fileLinesOfCode;
      }
    }
  }

  return linesOfCode;
}

function isCodeFile(fileName) {
  const extensions = config.extensions;
  const fileExtension = fileName.substring(fileName.lastIndexOf("."));
  return extensions.includes(fileExtension);
}

function countLinesOfCode(fileContent) {
  const lines = fileContent.split("\n");
  let linesOfCode = 0;

  for (const line of lines) {
    if (
      line.trim() !== "" &&
      !line.trim().startsWith("//") &&
      !line.trim().startsWith("/*")
    ) {
      linesOfCode++;
    }
  }

  return linesOfCode;
}

function updateReadme(linesOfCode) {
  const readmeFilePath = config.readmeFileName;
  fs.readFile(readmeFilePath, "utf-8", (err, data) => {
    if (err) throw err;

    const updatedData = data.replace(
      new RegExp(`${config.message}[0-9]+`, "g"),
      `${config.message}${linesOfCode}`
    );

    fs.writeFile(readmeFilePath, updatedData, "utf-8", (err) => {
      if (err) throw err;
      console.log("README updated with code statistics");
    });
  });
}

collectCode().catch((error) => {
  console.error("Error collecting code:", error);
  process.exit(1);
});
