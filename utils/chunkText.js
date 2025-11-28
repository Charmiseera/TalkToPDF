/**
 * Splits a large text string into smaller chunks of specified size.
 * Useful for breaking down long documents for embedding or processing.
 *
 * @param {string} text - The full text content to be chunked
 * @param {number} size - Maximum size of each chunk (default: 1000 characters)
 * @returns {string[]} - An array of text chunks
 */
exports.chunkText = (text, size = 1000) => {
  const chunks = [];

  // Loop through the text and slice it into chunks of the given size
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }

  return chunks;
};
