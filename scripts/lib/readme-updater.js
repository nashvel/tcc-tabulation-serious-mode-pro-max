/**
 * README file updater
 */

const fs = require('fs');

/**
 * Update README.md with contributor table
 * @param {string} readmePath - Path to README.md file
 * @param {string} contributorTable - HTML contributor table
 * @returns {void}
 */
function updateReadmeFile(readmePath, contributorTable) {
  try {
    // Read current README
    let readmeContent = fs.readFileSync(readmePath, 'utf8');

    // Replace the contributor section
    const regex = /<!-- ALL-CONTRIBUTORS-LIST:START -->[\s\S]*?<!-- ALL-CONTRIBUTORS-LIST:END -->/;
    readmeContent = readmeContent.replace(regex, contributorTable);

    // Write back to README
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log('README.md updated with latest contributors');
  } catch (error) {
    console.error('Error updating README:', error.message);
    throw error;
  }
}

module.exports = { updateReadmeFile };
