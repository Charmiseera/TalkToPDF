require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();

const chatRoutes = require("./routes/chatRoutes");

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for public assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Static folder for uploaded PDFs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Frontend Route
app.get("/", (req, res) => {
    res.render("index");
});

// API Routes
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});