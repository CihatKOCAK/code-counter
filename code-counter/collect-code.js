const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit();

const username = 'CihatKOCAK';

async function collectCode() {
  let totalLinesOfCode = 0;

  const { data: repositories } = await octokit.repos.listForUser({
    username: username,
  });

  for (const repo of repositories) {
    console.log(`Collecting code from ${repo.name}`);

    const { data: contents } = await octokit.repos.getContent({
      owner: username,
      repo: repo.name,
      path: '',
    });

    for (const file of contents) {
      if (file.type === 'file' && isCodeFile(file.name)) {
        const { data: fileContent } = await octokit.repos.getContent({
          owner: username,
          repo: repo.name,
          path: file.path,
        });
        const linesOfCode = countLinesOfCode(fileContent);
        totalLinesOfCode += linesOfCode;
      }
    }
  }

  console.log(`Total lines of code: ${totalLinesOfCode}`);

  updateReadme(totalLinesOfCode);
}

function isCodeFile(fileName) {
 const extensions = [
    ".js",
    ".py",
    ".java",
    ".jsx",
    ".html",
    ".css",
    ".scss",
    ".saas",
    ".ts",
    ".tsx",
  ];
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  return extensions.includes(fileExtension);
}

function countLinesOfCode(fileContent) {
  const lines = fileContent.split('\n');
  let linesOfCode = 0;

  for (const line of lines) {
    if (line.trim() !== '' && !line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
      linesOfCode++;
    }
  }

  return linesOfCode;
}

function updateReadme(linesOfCode) {
  const readmeFilePath = 'README.md';
  fs.readFile(readmeFilePath, 'utf-8', (err, data) => {
    if (err) throw err;

    const updatedData = data.replace(
      /This profile contains a total of [\d,]+ lines of code across all projects\. We're growing steadily\./,
      `This profile contains a total of ${linesOfCode.toLocaleString()} lines of code across all projects. We're growing steadily.`
    );

    fs.writeFile(readmeFilePath, updatedData, 'utf-8', (err) => {
      if (err) throw err;
      console.log('README updated with code statistics');
    });
  });
}

collectCode().catch((error) => {
  console.error('Error collecting code:', error);
  process.exit(1);
});
