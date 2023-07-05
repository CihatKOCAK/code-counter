const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const organization = '<organization>';

async function collectCode() {
  let totalLinesOfCode = 0;

  const repos = await octokit.repos.listForOrg({
    org: organization,
  });

  for (const repo of repos.data) {
    console.log(`Collecting code from ${repo.name}`);

    const contents = await octokit.repos.getContent({
      owner: organization,
      repo: repo.name,
      path: '',
    });

    for (const file of contents.data) {
      if (file.type === 'file' && isCodeFile(file.name)) {
        const downloadUrl = file.download_url;
        const fileContent = await octokit.request(downloadUrl);
        const linesOfCode = fileContent.data.split('\n').length;
        totalLinesOfCode += linesOfCode;
      }
    }
  }

  console.log(`Total lines of code: ${totalLinesOfCode}`);

  updateReadme(totalLinesOfCode);
}

function isCodeFile(fileName) {
  const extensions = ['.js', '.py', '.java'];
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  return extensions.includes(fileExtension);
}

function updateReadme(linesOfCode) {
  const readmeFilePath = 'README.md';
  fs.readFile(readmeFilePath, 'utf-8', (err, data) => {
    if (err) throw err;

    const updatedData = data.replace(
      /Bu organizasyonda yer alan tüm projeler toplamda [\d,]+ satır koda sahiptir\. Giderek büyüyoruz\./,
      `Bu organizasyonda yer alan tüm projeler toplamda ${linesOfCode.toLocaleString()} satır koda sahiptir. Giderek büyüyoruz.`
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
