/**
 * GitHub API utilities
 */

const https = require('https');

const CONFIG = {
  GITHUB_API_URL: 'api.github.com',
  USER_AGENT: 'TCC-Tabulation-System'
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
        'User-Agent': CONFIG.USER_AGENT,
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
 * Fetch pull requests for a contributor
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} - Array of pull requests
 */
async function fetchContributorPRs(owner, repo, username) {
  try {
    const endpoint = `/repos/${owner}/${repo}/pulls?state=all&creator=${username}&per_page=100`;
    return await fetchFromGitHub(endpoint);
  } catch (error) {
    console.warn(`Could not fetch PRs for ${username}:`, error.message);
    return [];
  }
}

module.exports = { fetchFromGitHub, fetchContributorPRs };
