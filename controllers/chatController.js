// Import services for PDF parsing, embedding, and Gemini-based Q&A
const pdfService = require("../services/pdfService");
const embeddingService = require("../services/embeddingService");
const geminiService = require("../services/geminiService");
const persistenceService = require("../services/persistenceService");

// This will hold the in-memory vector store for the uploaded PDF
let memoryVectorStore = null;
let currentPdfName = null;

// Load saved vector store on startup if it exists
(async () => {
  try {
    const metadata = await persistenceService.loadVectorStoreMetadata();
    if (metadata && metadata.documents) {
      memoryVectorStore = await embeddingService.recreateStore(metadata.documents);
      currentPdfName = metadata.pdfFileName;
      console.log(`✓ Restored vector store: ${currentPdfName} (${metadata.documentCount} chunks)`);
    }
  } catch (error) {
    console.error('Failed to restore vector store:', error);
  }
})();

/**
 * Handle PDF upload, parse it into chunks, and create an embedding-based vector store
 * @route POST /upload
 */
exports.uploadPDF = async (req, res) => {
  const fs = require('fs').promises;
  let pdfPath = null;

  try {
    pdfPath = req.file.path; // Path to the uploaded PDF file
    const pdfFileName = req.file.originalname;

    // Parse the PDF and split its content into smaller chunks
    const textChunks = await pdfService.parseAndChunk(pdfPath);

    // Create an in-memory vector store from the text chunks
    memoryVectorStore = await embeddingService.createStore(textChunks);
    currentPdfName = pdfFileName;

    // Save the vector store to Supabase for persistence
    await persistenceService.saveVectorStore(memoryVectorStore, pdfFileName);

    // Clean up: Delete the uploaded PDF file (we don't need it anymore)
    try {
      await fs.unlink(pdfPath);
      console.log(`✓ Cleaned up PDF file: ${pdfFileName}`);
    } catch (cleanupError) {
      console.warn('Warning: Could not delete PDF file:', cleanupError.message);
    }

    res.json({
      message: "PDF processed and indexed.",
      fileName: pdfFileName,
      chunks: textChunks.length
    });
  } catch (err) {
    // Clean up the file if processing failed
    if (pdfPath) {
      try {
        const fs = require('fs').promises;
        await fs.unlink(pdfPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Handle a user's question by retrieving context from the vector store
 * and using the Gemini model to generate an answer
 * @route POST /ask
 */
exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    // If no PDF has been uploaded yet, return an error
    if (!memoryVectorStore) {
      return res.status(400).json({ error: "No PDF uploaded yet." });
    }

    // Perform a similarity search to find relevant content from the PDF
    const context = await embeddingService.queryStore(
      memoryVectorStore,
      question
    );

    // Ask the Gemini model using the retrieved context and the question
    const answer = await geminiService.askGemini(context, question);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get current PDF info
 * @route GET /info
 */
exports.getPdfInfo = async (req, res) => {
  try {
    if (!memoryVectorStore || !currentPdfName) {
      return res.json({ hasPdf: false });
    }

    res.json({
      hasPdf: true,
      fileName: currentPdfName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
