// backend/utils/similarity.js
const stringSimilarity = require('string-similarity');

/**
 * Returns a similarity score between 0 and 1 for two strings,
 * based on character‐level comparison.
 */
function computeSimilarity(reference, studentAnswer) {
  // Fallback to empty strings if someone passes undefined/null
  const a = String(reference || '');
  const b = String(studentAnswer || '');
  return stringSimilarity.compareTwoStrings(a, b);
}

module.exports = { computeSimilarity };
