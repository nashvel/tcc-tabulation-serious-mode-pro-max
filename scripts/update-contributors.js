#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_OWNER = 'nashvel';
const REPO_NAME = 'tcc-tabulation-serious-mode-pro-max';
const README_PATH = path.join(__dirname, '..', 'README.md');

// Emoji mappings for contribution types
const CONTRIBUTION_EMOJIS = {
  code: '💻',
  design: '🎨',
  docs: '📖',
  infrastructure: '🏗️',
  setup: '🚀',
  bug: '🐛',
  review: '👀'
};

function fetchFromGitHub(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: 'GET',
      headers: {
        'User-Agent': 'TCC-Tabulation-System',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    // Use GitHub token if available for higher rate limits
    if (process.env.GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function getContributors() {
  try {
    console.log('Fetching contributors from GitHub...');
    const contributors = await fetchFromGitHub(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=100&sort=contributions`
    );

    // Calculate total commits
    const totalCommits = contributors.reduce((sum, c) => sum + c.contributions, 0);

    // Generate contributor rows
    const rows = contributors.map((contributor) => {
      const percentage = ((contributor.contributions / totalCommits) * 100).toFixed(0);
      const emojis = getEmojisForContributor(contributor.login);

      return `    <td align="center">
      <a href="https://github.com/${contributor.login}">
        <img src="https://github.com/${contributor.login}.png" width="100px;" alt="${contributor.login}"/>
        <br />
        <sub><b>${contributor.login}</b></sub>
      </a>
      <br />
      <sub>${contributor.contributions} commits (${percentage}%)</sub>
      <br />
      ${emojis}
    </td>`;
    });

    // Split into rows of 3 contributors per row
    const tableRows = [];
    for (let i = 0; i < rows.length; i += 3) {
      const rowItems = rows.slice(i, i + 3).join('\n');
      tableRows.push(`  <tr>\n${rowItems}\n  </tr>`);
    }

    const contributorTable = `<!-- ALL-CONTRIBUTORS-LIST:START -->
<table>
${tableRows.join('\n')}
</table>
<!-- ALL-CONTRIBUTORS-LIST:END -->`;

    return contributorTable;
  } catch (error) {
    console.error('Error fetching contributors:', error.message);
    process.exit(1);
  }
}

function getEmojisForContributor(username) {
  // Default emojis based on contribution level
  const emojiMap = {
    'nashvel': '💻 🎨 📖 🏗️',
    'brandon': '🚀'
  };

  return emojiMap[username.toLowerCase()] || '💻';
}

async function updateReadme() {
  try {
    // Read current README
    let readmeContent = fs.readFileSync(README_PATH, 'utf8');

    // Get updated contributor table
    const contributorTable = await getContributors();

    // Replace the contributor section
    const regex = /<!-- ALL-CONTRIBUTORS-LIST:START -->[\s\S]*?<!-- ALL-CONTRIBUTORS-LIST:END -->/;
    readmeContent = readmeContent.replace(regex, contributorTable);

    // Write back to README
    fs.writeFileSync(README_PATH, readmeContent, 'utf8');
    console.log('✓ README.md updated with latest contributors');
  } catch (error) {
    console.error('Error updating README:', error.message);
    process.exit(1);
  }
}

// Run the update
updateReadme();
