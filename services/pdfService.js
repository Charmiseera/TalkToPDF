// Import required modules
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { chunkText } = require("../utils/chunkText");

/**
 * Reads a PDF file from the given path, extracts text content,
 * and splits the text into smaller chunks for embedding.
 * @param {string} pdfPath - The file path of the uploaded PDF
 * @returns {Promise<string[]>} - An array of text chunks from the PDF
 */
exports.parseAndChunk = async (pdfPath) => {
  // Read the PDF file into a buffer
  const dataBuffer = fs.readFileSync(pdfPath);

  // Extract text content from the PDF using pdf-parse
  const pdfData = await pdfParse(dataBuffer);

  // Split the full text into smaller chunks for processing (e.g., for embeddings)
  const chunks = chunkText(pdfData.text);
  return chunks;
};
