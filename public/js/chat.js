// DOM Elements
const pdfFileInput = document.getElementById('pdf-file');
const uploadBtn = document.getElementById('upload-btn');
const uploadSection = document.querySelector('.upload-section');
const uploadStatus = document.querySelector('.upload-status');
const fileName = document.querySelector('.file-name');
const questionInput = document.getElementById('question-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');

let isPdfUploaded = false;
let selectedFile = null;

// File Upload Handlers
uploadSection.addEventListener('click', (e) => {
    // Don't trigger file input if clicking the upload button
    if (e.target.id === 'upload-btn' || e.target.closest('#upload-btn')) {
        return;
    }
    pdfFileInput.click();
});

pdfFileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
        fileName.textContent = selectedFile.name;
        uploadBtn.disabled = false;
    } else {
        showUploadStatus('Please select a valid PDF file', 'error');
        selectedFile = null;
        uploadBtn.disabled = true;
    }
});

// Drag and Drop
uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.classList.add('dragover');
});

uploadSection.addEventListener('dragleave', () => {
    uploadSection.classList.remove('dragover');
});

uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        selectedFile = file;
        pdfFileInput.files = e.dataTransfer.files;
        fileName.textContent = selectedFile.name;
        uploadBtn.disabled = false;
    } else {
        showUploadStatus('Please drop a valid PDF file', 'error');
    }
});

// Upload PDF
uploadBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); // Prevent event from bubbling to uploadSection

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    try {
        const response = await fetch('/api/chat/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            isPdfUploaded = true;
            showUploadStatus(`✓ ${selectedFile.name} uploaded successfully!`, 'success');
            uploadBtn.textContent = 'Upload Another PDF';
            uploadBtn.disabled = false;

            // Clear existing messages and show welcome message
            messagesContainer.innerHTML = '';
            addMessage('assistant', `Great! I've processed "${selectedFile.name}". You can now ask me questions about this document.`);

            // Enable chat input
            questionInput.disabled = false;
            questionInput.placeholder = 'Ask a question about your PDF...';
        } else {
            throw new Error(data.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showUploadStatus(`Failed to upload: ${error.message}`, 'error');
        uploadBtn.textContent = 'Upload PDF';
        uploadBtn.disabled = false;
    }
});

// Show Upload Status
function showUploadStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status ${type}`;
}

// Send Question
sendBtn.addEventListener('click', sendQuestion);

questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuestion();
    }
});

async function sendQuestion() {
    const question = questionInput.value.trim();

    if (!question) return;

    if (!isPdfUploaded) {
        alert('Please upload a PDF first!');
        return;
    }

    // Disable input while processing
    questionInput.disabled = true;
    sendBtn.disabled = true;

    // Add user message
    addMessage('user', question);

    // Clear input
    questionInput.value = '';

    // Add loading message
    const loadingId = addMessage('assistant', '<div class="loading"><span></span><span></span><span></span></div>', true);

    try {
        const response = await fetch('/api/chat/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });

        const data = await response.json();

        // Remove loading message
        removeMessage(loadingId);

        if (response.ok) {
            addMessage('assistant', data.answer);
        } else {
            throw new Error(data.error || 'Failed to get answer');
        }
    } catch (error) {
        console.error('Question error:', error);
        removeMessage(loadingId);
        addMessage('assistant', `Sorry, I encountered an error: ${error.message}`);
    } finally {
        // Re-enable input
        questionInput.disabled = false;
        sendBtn.disabled = false;
        questionInput.focus();
    }
}

// Add Message to Chat
let messageIdCounter = 0;

function addMessage(role, content, isLoading = false) {
    const messageId = `msg-${messageIdCounter++}`;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.id = messageId;

    const avatar = role === 'user' ? 'You' : 'AI';

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar.charAt(0)}</div>
        <div class="message-content">${content}</div>
    `;

    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageId;
}

// Remove Message
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    questionInput.disabled = true;
    sendBtn.disabled = true;
    uploadBtn.disabled = true;

    // Check if there's a previously uploaded PDF
    try {
        const response = await fetch('/api/chat/info');
        const data = await response.json();

        if (data.hasPdf && data.fileName) {
            isPdfUploaded = true;
            showUploadStatus(`✓ ${data.fileName} (restored from previous session)`, 'success');
            uploadBtn.textContent = 'Upload Another PDF';
            uploadBtn.disabled = false;

            // Show welcome message
            messagesContainer.innerHTML = '';
            addMessage('assistant', `Welcome back! I still have "${data.fileName}" loaded. You can continue asking questions or upload a new PDF.`);

            // Enable chat input
            questionInput.disabled = false;
            questionInput.placeholder = 'Ask a question about your PDF...';
            sendBtn.disabled = false;
        }
    } catch (error) {
        console.log('No previous PDF found or error checking:', error);
    }
});
