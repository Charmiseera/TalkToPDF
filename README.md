# 📄 PDF Chat Assistant using Node.js + LangChain + Google Gemini

**Chat with your PDFs using AI!** This open-source project lets you upload any PDF file and ask natural language questions about its content using **Google Gemini LLM**, **LangChain**, and **Node.js**.

## 📚 **Keywords**: 

`PDF Chat Assistant`, `LangChain Node.js`, `Gemini LLM`, `Document Q&A`, `RAG`, `AI Chatbot`, `PDF Parser`, `Semantic Search`

---

## 🧰 Tech Stack

| Component       | Technology                  |
|----------------|-----------------------------|
| Backend         | Node.js (Express)           |
| AI/LLM API      | Google Gemini (via LangChain)|
| PDF Parsing     | `pdf-parse`                 |
| Embedding Store | LangChain Memory Vector DB  |
| Chunking        | Manual with configurable size |

---

## 🛠️ Installation

```bash
git clone https://github.com/your-username/pdf-chat-gemini.git
cd pdf-chat-gemini
npm install

```

## 🔐 Environment Variables

Create a .env file in the root:

```
PORT=3000
GEMINI_API_KEY=your_google_gemini_api_key

# Supabase Configuration (for vector storage)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Your Keys

- **Gemini API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Supabase**: Free account at [supabase.com](https://supabase.com)
  - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions

## 📦 Run the Project

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## 🌐 Web Interface

The application now includes a modern, ChatGPT-inspired web interface:

- **Dark Theme UI**: Professional ChatGPT-style design
- **Drag & Drop Upload**: Easy PDF file upload
- **Real-time Chat**: Interactive Q&A interface
- **Persistent Storage**: Vector store survives server restarts
- **Responsive Design**: Works on all devices

Visit `http://localhost:3000` after starting the server.

## 🚀 Deployment

Ready to deploy your PDF Chat Assistant? Check out the comprehensive **[DEPLOYMENT.md](./DEPLOYMENT.md)** guide covering:

- ✅ Render (Recommended - Free tier)
- ✅ Vercel (Fast deployments)
- ✅ Railway ($5/month free credit)
- ✅ Heroku (Paid plans)

### Quick Deploy to Render

1. Push code to GitHub
2. Create a Render account
3. Create a new Web Service from your repo
4. Add environment variable: `GEMINI_API_KEY`
5. Add persistent disk for `/opt/render/project/src/vector-store`
6. Deploy! 🎉

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.

## 📬 API Endpoints

### 1. Upload PDF

```
POST /api/chat/upload
Content-Type: multipart/form-data
Form field: pdf (upload a .pdf file)
```

- Parses PDF
- Extracts text
- Chunks and embeds it into memory

### 2. Ask a Question

```
POST /api/chat/ask
Content-Type: application/json

{
  "question": "What is this PDF about?"
}
```

- Returns answer based on the most relevant chunks from the uploaded PDF

#

## 📁 Project Structure

```
pdf-chat-assistant/
├── app.js
├── .env
├── controllers/
│   └── chatController.js
├── routes/
│   └── chatRoutes.js
├── services/
│   ├── pdfService.js
│   ├── embeddingService.js
│   └── geminiService.js
├── utils/
│   └── chunkText.js
├── uploads/
└── vector-store/
```

##  🧠 How It Works

- Upload: PDF gets parsed and split into chunks.
- Embed: Each chunk is turned into a vector using Gemini Embeddings.
- Store: Vectors are stored in a temporary in-memory vector store.
- Query: User asks a question → similar chunks are retrieved.
- Answer: Gemini responds using those chunks as context.

## 🧪 Example Usage

Use Postman or Insomnia to:

1. Upload a PDF to `/api/chat/upload`

2. Then POST to `/api/chat/ask` with your question

## Demo Link

[Demo](https://jam.dev/c/b569bc2b-6417-49ad-87ce-5672bbc63a22)

## 📄 License
MIT License

## 🙌 Acknowledgements
LangChain

Google Generative AI (Gemini)

pdf-parse
