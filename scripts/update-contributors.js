#!/usr/bin/env node

/**
 * Update Contributors Script
 * Fetches latest contributor data from GitHub API and updates README.md
 * 
 * Usage: npm run update-contributors
 * Or: node scripts/update-contributors.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  REPO_OWNER: 'nashvel',
  REPO_NAME: 'tcc-tabulation-serious-mode-pro-max',
  README_PATH: path.join(__dirname, '..', 'README.md'),
  GITHUB_API_URL: 'api.github.com',
  CONTRIBUTORS_PER_PAGE: 100,
  CONTRIBUTORS_PER_ROW: 3
};

/**
 * Fetch data from GitHub API
 * @param {string} endpoint - GitHub API endpoint
 * @returns {Promise<Array>} - Parsed JSON response
 */
function fetchFromGitHub(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: CONFIG.GITHUB_API_URL,
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

/**
 * Generate HTML table row for a contributor
 * @param {Object} contributor - Contributor object from GitHub API
 * @param {number} percentage - Contribution percentage
 * @returns {string} - HTML table cell
 */
function generateContributorCell(contributor, percentage) {
  return `    <td align="center">
      <a href="https://github.com/${contributor.login}">
        <img src="https://github.com/${contributor.login}.png" width="100px;" alt="${contributor.login}"/>
        <br />
        <sub><b>${contributor.login}</b></sub>
      </a>
      <br />
      <sub>${contributor.contributions} commits (${percentage}%)</sub>
    </td>`;
}

/**
 * Generate HTML table from contributors array
 * @param {Array} rows - Array of HTML table cells
 * @returns {string} - Complete HTML table
 */
function generateContributorTable(rows) {
  const tableRows = [];
  for (let i = 0; i < rows.length; i += CONFIG.CONTRIBUTORS_PER_ROW) {
    const rowItems = rows.slice(i, i + CONFIG.CONTRIBUTORS_PER_ROW).join('\n');
    tableRows.push(`  <tr>\n${rowItems}\n  </tr>`);
  }

  return `<!-- ALL-CONTRIBUTORS-LIST:START -->
<table>
${tableRows.join('\n')}
</table>
<!-- ALL-CONTRIBUTORS-LIST:END -->`;
}

/**
 * Fetch contributors from GitHub and generate HTML table
 * @returns {Promise<string>} - HTML table string
 */
async function getContributors() {
  try {
    console.log('Fetching contributors from GitHub...');
    const contributors = await fetchFromGitHub(
      `/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contributors?per_page=${CONFIG.CONTRIBUTORS_PER_PAGE}&sort=contributions`
    );

    // Calculate total commits
    const totalCommits = contributors.reduce((sum, c) => sum + c.contributions, 0);

    // Generate contributor rows
    const rows = contributors.map((contributor) => {
      const percentage = ((contributor.contributions / totalCommits) * 100).toFixed(0);
      return generateContributorCell(contributor, percentage);
    });

    return generateContributorTable(rows);
  } catch (error) {
    console.error('Error fetching contributors:', error.message);
    process.exit(1);
  }
}


/**
 * Update README.md with latest contributors
 * @returns {Promise<void>}
 */
async function updateReadme() {
  try {
    // Read current README
    let readmeContent = fs.readFileSync(CONFIG.README_PATH, 'utf8');

    // Get updated contributor table
    const contributorTable = await getContributors();

    // Replace the contributor section
    const regex = /<!-- ALL-CONTRIBUTORS-LIST:START -->[\s\S]*?<!-- ALL-CONTRIBUTORS-LIST:END -->/;
    readmeContent = readmeContent.replace(regex, contributorTable);

    // Write back to README
    fs.writeFileSync(CONFIG.README_PATH, readmeContent, 'utf8');
    console.log('README.md updated with latest contributors');
  } catch (error) {
    console.error('Error updating README:', error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  updateReadme();
}

module.exports = { updateReadme, getContributors };
