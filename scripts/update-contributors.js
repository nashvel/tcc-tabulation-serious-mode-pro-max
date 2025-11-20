#!/usr/bin/env node

/**
 * Update Contributors Script
 * Fetches latest contributor data from GitHub API and updates README.md
 * 
 * Usage: npm run update-contributors
 * Or: node scripts/update-contributors.js
 */

const path = require('path');
const { fetchFromGitHub } = require('./lib/github');
const { generateContributorCell, generateContributorTable } = require('./lib/html-generator');
const { updateReadmeFile } = require('./lib/readme-updater');

// Configuration
const CONFIG = {
  REPO_OWNER: 'nashvel',
  REPO_NAME: 'tcc-tabulation-serious-mode-pro-max',
  README_PATH: path.join(__dirname, '..', 'README.md'),
  CONTRIBUTORS_PER_PAGE: 100
};

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
 * Main function to update README with latest contributors
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const contributorTable = await getContributors();
    updateReadmeFile(CONFIG.README_PATH, contributorTable);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  main();
}

module.exports = { getContributors, main };
