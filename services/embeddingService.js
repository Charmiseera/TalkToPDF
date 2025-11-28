// Import necessary modules from LangChain and Google GenAI
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { Document } = require("langchain/document");

/**
 * Create an in-memory vector store from plain text documents using Google Gemini embeddings
 * @param {string[]} texts - Array of text strings to embed and store
 * @returns {Promise<MemoryVectorStore>} - The initialized vector store
 */
exports.createStore = async (texts) => {
  // Convert each text into a LangChain Document
  const docs = texts.map((text) => new Document({ pageContent: text }));

  // Initialize the Google Gemini embeddings with API key from environment
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Create a memory vector store by embedding the documents
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return store;
};

/**
 * Query the vector store using similarity search
 * @param {MemoryVectorStore} store - The vector store to search in
 * @param {string} query - The query text to search with
 * @returns {Promise<string>} - Concatenated string of top 3 similar document contents
 */
exports.queryStore = async (store, query) => {
  // Perform a similarity search and retrieve top 3 matching documents
  const results = await store.similaritySearch(query, 3);

  // Combine the page content of matching documents into a single string
  return results.map((doc) => doc.pageContent).join("\n");
};

/**
 * Recreate vector store from saved documents
 * @param {Array} documents - Array of document objects with pageContent and metadata
 * @returns {Promise<MemoryVectorStore>} - The recreated vector store
 */
exports.recreateStore = async (documents) => {
  // Convert plain objects back to LangChain Documents
  const docs = documents.map((doc) => new Document({
    pageContent: doc.pageContent,
    metadata: doc.metadata || {}
  }));

  // Initialize the Google Gemini embeddings with API key from environment
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Create a memory vector store by embedding the documents
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return store;
};
