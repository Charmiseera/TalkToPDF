// Import required modules
const express = require("express");
const router = express.Router();
const multer = require("multer");

// Configure Multer to store uploaded files in the "uploads/" directory
const upload = multer({ dest: "uploads/" });

// Import chat controller functions
const chatController = require("../controllers/chatController");

// Route to handle PDF file upload
// Expects a file field named "pdf" in multipart/form-data
router.post("/upload", upload.single("pdf"), chatController.uploadPDF);

// Route to handle user's question input
// Expects a JSON body with a "question" field
router.post("/ask", chatController.askQuestion);

// Route to get current PDF information
router.get("/info", chatController.getPdfInfo);

// Export the router to be used in the main Express app
module.exports = router;
