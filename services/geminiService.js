// Import the ChatGoogleGenerativeAI class from LangChain's Google GenAI integration
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

/**
 * Ask a question to the Gemini model using LangChain's ChatGoogleGenerativeAI
 * @param {string} context - Relevant background information or reference text
 * @param {string} question - The actual question to be asked
 * @returns {Promise<string>} - The model's answer as a string
 */
exports.askGemini = async (context, question) => {
  // Initialize the Gemini chat model with the specified version and API key
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Ask the question in context (formatted as a single prompt)
  const response = await model.invoke(`${context}\n\nQuestion: ${question}`);
  return response.content;
};
