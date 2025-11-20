/**
 * HTML generation utilities for contributor table
 */

const CONFIG = {
  CONTRIBUTORS_PER_ROW: 3
};

/**
 * Generate HTML table cell for a contributor
 * @param {Object} contributor - Contributor object from GitHub API
 * @param {number} percentage - Contribution percentage
 * @param {number} prCount - Number of pull requests
 * @returns {string} - HTML table cell
 */
function generateContributorCell(contributor, percentage, prCount = 0) {
  let stats = `${contributor.contributions} commits (${percentage}%)`;
  if (prCount > 0) {
    stats += ` | ${prCount} PR${prCount !== 1 ? 's' : ''}`;
  }
  
  return `    <td align="center">
      <a href="https://github.com/${contributor.login}">
        <img src="https://github.com/${contributor.login}.png" width="100px;" alt="${contributor.login}"/>
        <br />
        <sub><b>${contributor.login}</b></sub>
      </a>
      <br />
      <sub>${stats}</sub>
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

module.exports = { generateContributorCell, generateContributorTable };
