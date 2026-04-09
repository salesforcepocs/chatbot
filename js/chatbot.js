// Chatbot Widget
class ChatbotWidget {
  constructor() {
    console.log('✅ ChatbotWidget constructor called');
    this.isOpen = false;
    this.messages = [];
    this.uploadedFiles = []; // Track uploaded files
    this.conversationId = this.generateConversationId();
    this.apiUrl = 'https://mfobabs5n0.execute-api.us-east-2.amazonaws.com/dev/ask';
    this.uploadUrl = 'https://mfobabs5n0.execute-api.us-east-2.amazonaws.com/dev/upload';
    this.isLoading = false;
    this.MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
    this.ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    this.ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
    this.init();
  }

  generateConversationId() {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  init() {
    console.log('🔧 ChatbotWidget.init() called');
    this.createChatbotHTML();
    this.attachEventListeners();
    this.loadInitialMessage();
    console.log('🔧 ChatbotWidget.init() complete');
  }

  createChatbotHTML() {
    console.log('🖼️ Creating chatbot HTML...');
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-widget';
    chatbotContainer.innerHTML = `
      <div class="chatbot-button" id="chatbot-toggle">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      
      <div class="chatbot-window" id="chatbot-window" style="display: none;">
        <div class="chatbot-header">
          <div class="chatbot-header-content">
            <h3>State Lottery Assistant</h3>
            <p>How can we help?</p>
          </div>
          <button class="chatbot-close" id="chatbot-close">×</button>
        </div>
        
        <div class="chatbot-messages" id="chatbot-messages"></div>
        
        <div class="chatbot-input-area">
          <input 
            type="text" 
            id="chatbot-input" 
            placeholder="Type your question..."
            autocomplete="off"
          />
          <input 
            type="file" 
            id="chatbot-file-input" 
            accept=".pdf,.docx,.txt"
            style="display: none;"
          />
          <button class="chatbot-upload" id="chatbot-upload-btn" title="Upload document">
            📎
          </button>
          <button class="chatbot-send" id="chatbot-send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(chatbotContainer);
    console.log('✅ Chatbot HTML appended to DOM');
    this.addStyles();
    console.log('✅ Chatbot styles added');
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #chatbot-widget {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }

      .chatbot-button {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
        color: #0A1628;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        font-size: 0;
      }

      .chatbot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
      }

      .chatbot-button svg {
        width: 24px;
        height: 24px;
      }

      .chatbot-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 500px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chatbot-header {
        background: linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%);
        color: white;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid rgba(212, 175, 55, 0.2);
      }

      .chatbot-header-content h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #F4D03F;
      }

      .chatbot-header-content p {
        margin: 0.25rem 0 0 0;
        font-size: 0.85rem;
        color: #ffffff;
        opacity: 1;
      }

      .chatbot-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s;
      }

      .chatbot-close:hover {
        opacity: 0.7;
      }

      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: #f9fafb;
      }

      .chatbot-message {
        display: flex;
        gap: 0.75rem;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chatbot-message.user {
        justify-content: flex-end;
      }

      .chatbot-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
      }

      .chatbot-message.assistant .chatbot-message-avatar {
        background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
        color: #0A1628;
      }

      .chatbot-message.user .chatbot-message-avatar {
        background: #e5e7eb;
        color: #6b7280;
      }

      .chatbot-message-content {
        max-width: 420px;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        line-height: 1.6;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .chatbot-message.assistant .chatbot-message-content {
        background: white;
        color: #1f2937;
        border: 1px solid #e5e7eb;
      }

      .chatbot-message.user .chatbot-message-content {
        background: #0A1628;
        color: white;
        border-radius: 8px 0 8px 8px;
      }

      .chatbot-input-area {
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 0.5rem;
        background: white;
      }

      #chatbot-input {
        flex: 1;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
        font-family: inherit;
        transition: border-color 0.2s;
      }

      #chatbot-input:focus {
        outline: none;
        border-color: #D4AF37;
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
      }

      .chatbot-send {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 6px;
        background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
        color: #0A1628;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-weight: 600;
      }

      .chatbot-send:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
      }

      .chatbot-send:active {
        transform: translateY(0);
      }

      .chatbot-upload {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 6px;
        background: #e5e7eb;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-weight: 600;
        font-size: 1.2rem;
      }

      .chatbot-upload:hover {
        background: #d1d5db;
        transform: translateY(-2px);
      }

      .chatbot-upload:active {
        transform: translateY(0);
      }

      .chatbot-file-preview {
        background: #f0f4f8;
        border-left: 4px solid #D4AF37;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
        color: #374151;
      }

      .chatbot-file-preview strong {
        color: #0A1628;
      }

      /* Scrollbar styling */
      .chatbot-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chatbot-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chatbot-messages::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      .chatbot-messages::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }

      /* Loading indicator styles */
      .chatbot-typing {
        display: flex;
        gap: 0.4rem;
        align-items: center;
        padding: 0.75rem 1rem;
      }

      .chatbot-typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #9ca3af;
        animation: typing 1.4s infinite;
      }

      .chatbot-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .chatbot-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.7;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }

      .chatbot-message-content {
        word-wrap: break-word;
        overflow-wrap: break-word;
        line-height: 1.6;
      }

      .chatbot-message-content h1,
      .chatbot-message-content h2,
      .chatbot-message-content h3 {
        margin: 1rem 0 0.5rem 0;
      }

      .chatbot-message-content h1 {
        font-size: 1.5rem;
        font-weight: 800;
        border-bottom: 3px solid #D4AF37;
        padding-bottom: 0.75rem;
        margin-top: 1.5rem;
      }

      .chatbot-message-content h2 {
        font-size: 1.3rem;
        font-weight: 700;
        border-bottom: 2px solid #D4AF37;
        padding-bottom: 0.5rem;
        margin-top: 1.5rem;
      }

      .chatbot-message-content h3 {
        font-size: 1.1rem;
        font-weight: 700;
      }

      .chatbot-message-content ul {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
        list-style-type: disc;
      }

      .chatbot-message-content ol {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
        list-style-type: decimal;
      }

      .chatbot-message-content li {
        margin: 0.4rem 0;
        color: #374151;
      }

      .chatbot-message-content pre {
        background: #f3f4f6;
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
        margin: 0.75rem 0;
        border-left: 4px solid #D4AF37;
      }

      .chatbot-message-content code {
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 0.85em;
      }

      .chatbot-message-content pre code {
        color: #0A1628;
      }

      .chatbot-message-content em {
        font-style: italic;
        color: #374151;
      }

      .chatbot-message-content strong {
        font-weight: 700;
        color: #0A1628;
      }

      .chatbot-message-content a {
        color: #D4AF37;
        text-decoration: underline;
      }

      .chatbot-message.user .chatbot-message-content a {
        color: #F4D03F;
      }

      .chatbot-error {
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #991b1b;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .chatbot-window {
          width: 100vw;
          height: 100vh;
          max-width: 100%;
          max-height: 100%;
          bottom: 0;
          right: 0;
          border-radius: 0;
        }

        #chatbot-widget {
          bottom: 1rem;
          right: 1rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  attachEventListeners() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const uploadBtn = document.getElementById('chatbot-upload-btn');
    const fileInput = document.getElementById('chatbot-file-input');

    toggle.addEventListener('click', () => this.toggleChatbot());
    close.addEventListener('click', () => this.closeChatbot());
    sendBtn.addEventListener('click', () => this.sendMessage());
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  toggleChatbot() {
    if (this.isOpen) {
      this.closeChatbot();
    } else {
      this.openChatbot();
    }
  }

  openChatbot() {
    const window = document.getElementById('chatbot-window');
    window.style.display = 'flex';
    this.isOpen = true;
    document.getElementById('chatbot-input').focus();
  }

  closeChatbot() {
    const window = document.getElementById('chatbot-window');
    window.style.display = 'none';
    this.isOpen = false;
  }

  loadInitialMessage() {
    setTimeout(() => {
      this.addMessage('Hi there! 👋 I\'m your Portal Assistant. I can help you with case management, team coordination, and general questions about the platform. What can I help you with today?', 'assistant');
    }, 500);
  }

  addMessage(text, sender = 'user', isError = false) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'chatbot-message-avatar';
    avatar.textContent = sender === 'user' ? 'You' : 'AI';

    const content = document.createElement('div');
    content.className = 'chatbot-message-content';
    if (isError) {
      content.classList.add('chatbot-error');
    }
    
    // Support rich formatting
    content.innerHTML = this.formatMessage(text);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);

    // Store message in history
    this.messages.push({
      role: sender === 'user' ? 'user' : 'assistant',
      content: text
    });

    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatMessage(text) {
    // Escape HTML but preserve intentional formatting
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Convert markdown-like formatting to HTML
    
    // Headings: # Title, ## Subtitle, ### Sub-subtitle (must be at line start)
    formatted = formatted
      .replace(/^### (.*?)$/gm, '<h3 style="margin: 1rem 0 0.5rem 0; font-size: 1.1rem; font-weight: 700; color: #0A1628;">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 style="margin: 1.5rem 0 0.75rem 0; font-size: 1.3rem; font-weight: 700; color: #0A1628; border-bottom: 2px solid #D4AF37; padding-bottom: 0.5rem;">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 style="margin: 1.5rem 0 0.75rem 0; font-size: 1.5rem; font-weight: 800; color: #0A1628; border-bottom: 3px solid #D4AF37; padding-bottom: 0.75rem;">$1</h1>');
    
    // Bold: **text** or __text__
    formatted = formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #0A1628;">$1</strong>')
      .replace(/__(.+?)__/g, '<strong style="font-weight: 700; color: #0A1628;">$1</strong>');
    
    // Italic: *text* or _text_
    formatted = formatted
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #374151;">$1</em>')
      .replace(/_(.*?)_/g, '<em style="font-style: italic; color: #374151;">$1</em>');
    
    // Code blocks: ```code```
    formatted = formatted.replace(/```([\s\S]*?)```/g, function(match, code) {
      return '<pre style="background: #f3f4f6; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 0.75rem 0; border-left: 4px solid #D4AF37;"><code style="font-family: \'Monaco\', \'Courier New\', monospace; font-size: 0.85em; color: #0A1628;">$1</code></pre>'.replace('$1', code);
    });
    
    // Inline code: `code`
    formatted = formatted
      .replace(/`(.+?)`/g, '<code style="background: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: \'Monaco\', \'Courier New\', monospace; font-size: 0.85em; color: #D4AF37;">$1</code>');
    
    // Bullet lists: - Item
    // Split by lines, find consecutive bullet lines, and convert to <ul>
    const lines = formatted.split('<br/>');
    let result = [];
    let inList = false;
    let listItems = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('- ')) {
        // This is a list item
        const text = line.replace(/^- /, '').trim();
        listItems.push('<li style="margin: 0.3rem 0; color: #374151;">' + text + '</li>');
        inList = true;
      } else if (inList && line === '') {
        // Empty line might end the list
        continue;
      } else {
        // Not a list item
        if (inList && listItems.length > 0) {
          // Close the list
          result.push('<ul style="margin: 0.75rem 0; padding-left: 1.5rem; list-style-type: disc;">' + listItems.join('') + '</ul>');
          listItems = [];
          inList = false;
        }
        if (line !== '') {
          result.push(line);
        }
      }
    }
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
      result.push('<ul style="margin: 0.75rem 0; padding-left: 1.5rem; list-style-type: disc;">' + listItems.join('') + '</ul>');
    }
    
    formatted = result.join('<br/>');
    
    return formatted;
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message assistant';
    messageDiv.id = 'chatbot-typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'chatbot-message-avatar';
    avatar.textContent = 'AI';

    const content = document.createElement('div');
    content.className = 'chatbot-message-content chatbot-typing';
    content.innerHTML = '<div class="chatbot-typing-dot"></div><div class="chatbot-typing-dot"></div><div class="chatbot-typing-dot"></div>';

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);

    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('chatbot-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    console.log('📄 File selected:', file.name, 'Size:', file.size);

    // Validate file type
    if (!this.isValidFileType(file)) {
      this.addMessage(`❌ Invalid file type! Allowed types: ${this.ALLOWED_EXTENSIONS.join(', ')}`, 'assistant', true);
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.addMessage('❌ File is too large! Maximum size allowed is 25MB.', 'assistant', true);
      return;
    }

    // Upload file
    this.uploadFile(file);
  }

  isValidFileType(file) {
    // Check MIME type
    if (this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return true;
    }

    // Fallback: check extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    return this.ALLOWED_EXTENSIONS.includes(extension);
  }

  async uploadFile(file) {
    console.log('⬆️ Uploading file:', file.name);
    
    // Show upload progress
    this.addMessage(`📤 Uploading ${file.name}...`, 'user');
    
    try {
      // Read file as base64
      const base64File = await this.fileToBase64(file);
      
      const payload = {
        file: base64File,
        filename: file.name,
        conversationId: this.conversationId
      };

      console.log('📤 Upload payload size:', JSON.stringify(payload).length, 'bytes');

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔴 Upload error:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Upload response:', data);

      // Store file reference
      this.uploadedFiles.push({
        filename: file.name,
        fileId: data.fileId,
        s3Url: data.s3Url
      });

      // Display success message
      this.addMessage(`✅ Successfully uploaded: ${file.name}`, 'assistant');
      
      // Clear file input
      document.getElementById('chatbot-file-input').value = '';
    } catch (error) {
      console.error('❌ Upload error:', error);
      this.addMessage(`❌ Upload failed: ${error.message}`, 'assistant', true);
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the "data:...;base64," prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const text = input.value.trim();

    if (!text || this.isLoading) return;

    // Add user message
    this.addMessage(text, 'user');
    input.value = '';

    // Show loading indicator
    this.isLoading = true;
    this.showTypingIndicator();

    try {
      console.log('📤 Sending message:', text);
      const response = await this.callBedrockAPI(text);
      console.log('📥 Received response:', response);
      this.removeTypingIndicator();
      this.addMessage(response, 'assistant');
    } catch (error) {
      this.removeTypingIndicator();
      console.error('❌ API Error:', error);
      const errorMessage = `API Error: ${error.message}\n\n(Check Console for details)`;
      this.addMessage(errorMessage, 'assistant', true);
    } finally {
      this.isLoading = false;
      document.getElementById('chatbot-input').focus();
    }
  }

  async callBedrockAPI(userMessage) {
    const payload = {
      prompt: userMessage,
      conversationId: this.conversationId,
      messages: this.messages,
      uploadedFiles: this.uploadedFiles.length > 0 ? this.uploadedFiles : undefined
    };

    console.log('🔵 Calling Bedrock API with payload:', payload);
    console.log('🔵 API URL:', this.apiUrl);
    console.log('📎 Files included:', this.uploadedFiles.length);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors',
      });

      console.log('🟢 API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔴 API Error Response:', errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🟢 API Response Data:', data);
      console.log('🔍 Response keys:', Object.keys(data));
      
      // The Bedrock API returns the text in different possible fields
      let responseText = null;
      
      if (data.output_text) {
        responseText = data.output_text;
        console.log('✅ Found response in data.output_text');
      } else if (data.Text) {
        responseText = data.Text;
        console.log('✅ Found response in data.Text');
      } else if (data.response) {
        responseText = data.response;
        console.log('✅ Found response in data.response');
      } else {
        console.error('🔴 Response structure:', Object.keys(data));
        throw new Error('Invalid API response format - no output_text, Text, or response field found');
      }

      // Clean up the response text if needed
      responseText = responseText.trim();
      console.log('📝 Final response text:', responseText);
      return responseText;
    } catch (error) {
      console.error('🔴 Fetch Error:', error);
      throw error;
    }
  }
}

// Initialize chatbot when DOM is ready
console.log('📜 chatbot.js loaded! Document ready state:', document.readyState);

if (document.readyState === 'loading') {
  console.log('⏳ DOM still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded fired - initializing ChatbotWidget');
    new ChatbotWidget();
  });
} else {
  console.log('✅ DOM already loaded - initializing ChatbotWidget immediately');
  new ChatbotWidget();
}
