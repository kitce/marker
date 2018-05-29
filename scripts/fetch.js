const fetch = require('../lib/hkjc/fetch');

fetch()
.then(output)
.catch(console.error);

/**
 * Helper functions
 */
function output (markSixes) {
  console.log(`Successfully fetched ${markSixes.length} Mark Six records`);
}
