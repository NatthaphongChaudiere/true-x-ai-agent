class ChatApp {
    constructor() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.newChatBtn = document.querySelector('.new-chat-btn');
        this.sidebar = document.querySelector('.sidebar');

        // Context menu and rename dialog elements
        this.contextMenu = document.getElementById('contextMenu');
        this.renameDialog = document.getElementById('renameDialog');
        this.renameInput = document.getElementById('renameInput');
        this.renameItem = document.getElementById('renameItem');
        this.deleteItem = document.getElementById('deleteItem');
        this.confirmRename = document.getElementById('confirmRename');
        this.cancelRename = document.getElementById('cancelRename');

        this.messages = [];
        this.isTyping = false;
        this.currentRightClickedItem = null;
        this.chatCounter = 1;
        this.currentChatId = null;
        this.chatSessions = {}; // Store chat sessions by ID

        this.init();
    }

    init() {
        // Event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        this.newChatBtn.addEventListener('click', () => this.startNewChat());

        // Context menu event listeners
        this.renameItem.addEventListener('click', () => this.showRenameDialog());
        this.deleteItem.addEventListener('click', () => this.deleteChat());
        this.confirmRename.addEventListener('click', () => this.renameChat());
        this.cancelRename.addEventListener('click', () => this.hideRenameDialog());
        this.renameInput.addEventListener('keydown', (e) => this.handleRenameKeyPress(e));

        // Close context menu when clicking outside
        document.addEventListener('click', (e) => this.closeContextMenu(e));
        document.addEventListener('contextmenu', (e) => this.closeContextMenu(e));

        // Close rename dialog when clicking outside
        this.renameDialog.addEventListener('click', (e) => {
            if (e.target === this.renameDialog) {
                this.hideRenameDialog();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 140) + 'px';
        });
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInputChange() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isTyping;
    }

    async sendMessage() {
        const messageText = this.messageInput.value.trim();
        if (!messageText || this.isTyping) return;

        // Check if we're on the homepage (welcome message is visible)
        const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
        const isHomepage = welcomeMessage !== null;

        // If we're on the homepage, create a new chat session first
        if (isHomepage) {
            this.createNewChatFromHomepage();
        }

        // Add user message
        this.addMessage(messageText, 'user');

        // Clear input and disable send button
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.sendButton.disabled = true;
        this.isTyping = true;

        // Scroll to bottom
        this.scrollToBottom();

        // Simulate AI response
        await this.simulateAIResponse(messageText);
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'AI';

        const content = document.createElement('div');
        content.className = 'message-content';

        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;

        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();

        content.appendChild(messageText);
        content.appendChild(messageTime);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        // Remove welcome message if it exists
        const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        this.messagesContainer.appendChild(messageDiv);

        const message = { text, sender, time: new Date() };
        this.messages.push(message);

        // Save to current chat session if we have one
        if (this.currentChatId && this.chatSessions[this.currentChatId]) {
            this.chatSessions[this.currentChatId].messages.push(message);
        }

        this.scrollToBottom();
    }

    addWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = `
            <h2>Welcome to AI Assistant</h2>
            <p>How can I help you today?</p>
        `;
        this.messagesContainer.appendChild(welcomeDiv);
    }

    async simulateAIResponse(userMessage) {
        // Show typing indicator
        this.showTypingIndicator();

        // Simulate API delay
        await this.delay(1000 + Math.random() * 2000);

        // Remove typing indicator
        this.removeTypingIndicator();

        // Generate response based on user message
        const response = this.generateResponse(userMessage);

        // Add AI response
        this.addMessage(response, 'assistant');

        // Re-enable input
        this.isTyping = false;
        this.sendButton.disabled = false;
        this.messageInput.focus();
    }

    generateResponse(userMessage) {
        const responses = {
            // Greetings
            'hello': "Hello! Welcome to TrueX BigQuery Assistant. I'm here to help you with data analysis, SQL queries, and getting insights from your BigQuery datasets. What can I help you analyze today?",
            'hi': "Hi there! I'm your BigQuery Assistant. How can I help you with your data analysis today?",

            // BigQuery specific
            'bigquery': "BigQuery is Google's fully managed, serverless data warehouse that enables scalable analysis over petabytes of data. I can help you with:\n• Writing optimized SQL queries\n• Schema design and partitioning\n• Performance optimization\n• Data transformation and cleaning\n• Cost management\n• Machine learning integration\n\nWhat specific BigQuery task do you need help with?",
            'sql': "I'd be happy to help you with SQL queries for BigQuery! I can assist with:\n• Writing complex SELECT statements\n• JOINs and subqueries\n• Window functions and analytics\n• Array and struct operations\n• User-defined functions\n• Query optimization techniques\n\nWhat kind of SQL query do you need help with?",
            'query': "For BigQuery queries, I can help you:\n• Write efficient SQL code\n• Optimize query performance\n• Debug query errors\n• Explain query execution plans\n• Suggest best practices\n• Handle large datasets\n\nShare your query or describe what you're trying to achieve!",
            'data': "I can help you work with data in BigQuery! I can assist with:\n• Data exploration and profiling\n• Data cleaning and validation\n• Statistical analysis\n• Trend identification\n• Data visualization suggestions\n• ETL processes\n\nWhat data analysis task are you working on?",
            'table': "For BigQuery tables, I can help with:\n• Table schema design\n• Partitioning and clustering strategies\n• Data loading techniques\n• Table maintenance\n• Access control and security\n• Performance tuning\n\nWhat specific table operation do you need assistance with?",

            // General help
            'help': "I'm your BigQuery Assistant, specialized in data analytics and SQL. I can help with:\n💾 Writing and optimizing SQL queries\n📊 Data analysis and insights\n⚡ Performance tuning\n🔧 Schema design\n💰 Cost optimization\n📈 Data visualization\n\nWhat BigQuery task do you need help with?",
            'what can you do': "As your BigQuery Assistant, I specialize in:\n\n• **SQL Development**: Writing complex queries, optimization, debugging\n• **Data Analysis**: Statistical analysis, pattern recognition, insights\n• **Performance**: Query tuning, partitioning, clustering strategies\n• **Architecture**: Schema design, ETL processes, data modeling\n• **Best Practices**: Security, cost management, governance\n\nHow can I help with your BigQuery project today?",

            // Default
            'default': "I'm here to help with your BigQuery data analysis needs! Whether you need assistance writing SQL queries, optimizing performance, analyzing data patterns, or getting insights from your datasets, I'm ready to help. What specific BigQuery task or data challenge can I assist you with?"
        };

        const lowerMessage = userMessage.toLowerCase();

        // Check for BigQuery specific keywords first
        if (lowerMessage.includes('sql') || lowerMessage.includes('select') || lowerMessage.includes('query')) {
            return responses['sql'];
        }
        if (lowerMessage.includes('data') || lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
            return responses['data'];
        }
        if (lowerMessage.includes('table') || lowerMessage.includes('schema') || lowerMessage.includes('dataset')) {
            return responses['table'];
        }
        if (lowerMessage.includes('performance') || lowerMessage.includes('optimize') || lowerMessage.includes('cost')) {
            return "I can help optimize your BigQuery performance and manage costs! Key areas include:\n• Query optimization techniques\n• Partitioning and clustering\n• Slot management\n• Cost control strategies\n• Monitoring and alerting\n\nWhat performance or cost aspect would you like to explore?";
        }

        // Check for general keywords
        for (const [key, response] of Object.entries(responses)) {
            if (key !== 'default' && lowerMessage.includes(key)) {
                return response;
            }
        }

        // Check for question patterns
        if (lowerMessage.includes('?') || lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('when')) {
            return "That's a great question about BigQuery! To provide you with the most accurate assistance, could you tell me:\n• What specific task you're trying to accomplish?\n• What datasets or tables you're working with?\n• Any challenges or errors you're encountering?\n\nThis will help me provide you with the best possible guidance for your data analysis needs.";
        }

        // Default response
        return responses.default;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingMessage = this.messagesContainer.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    startNewChat() {
        // Clear messages
        this.messagesContainer.innerHTML = '';
        this.messages = [];

        // Add welcome message
        this.addWelcomeMessage();

        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Focus on input
        this.messageInput.focus();
    }

    createNewChatFromHomepage() {
        // Clear homepage welcome message
        this.messagesContainer.innerHTML = '';
        this.messages = [];

        // Generate new chat ID
        const chatId = `chat_${Date.now()}`;
        this.currentChatId = chatId;

        // Initialize empty chat session
        this.chatSessions[chatId] = {
            id: chatId,
            title: `Query Session ${this.chatCounter}`,
            messages: [],
            createdAt: new Date()
        };

        // Add new chat to history
        this.chatCounter++;
        this.addToHistory(`Query Session ${this.chatCounter}`, chatId);
    }

    
    loadHistory(item) {
        const chatId = item.getAttribute('data-chat-id');

        // Clear current messages
        this.messagesContainer.innerHTML = '';
        this.messages = [];

        // Set current chat ID
        this.currentChatId = chatId;

        // If we have a valid chat ID, load the chat session
        if (chatId && this.chatSessions[chatId]) {
            const chatSession = this.chatSessions[chatId];

            // Load all messages from the chat session
            chatSession.messages.forEach(message => {
                this.displayMessage(message.text, message.sender, message.time, false);
            });
        } else {
            // If no chat ID or session not found, show welcome message
            this.addWelcomeMessage();
        }

        // Focus on input
        this.messageInput.focus();
    }

    displayMessage(text, sender, time, saveToSession = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'AI';

        const content = document.createElement('div');
        content.className = 'message-content';

        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;

        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTime(time);

        content.appendChild(messageText);
        content.appendChild(messageTime);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        this.messagesContainer.appendChild(messageDiv);
        this.messages.push({ text, sender, time });

        // Save to current chat session if requested and we have one
        if (saveToSession && this.currentChatId && this.chatSessions[this.currentChatId]) {
            this.chatSessions[this.currentChatId].messages.push({ text, sender, time });
        }
    }

    addToHistory(title, chatId = null) {
        const historyContainer = document.querySelector('.chat-history');
        const newHistoryItem = document.createElement('div');
        newHistoryItem.className = 'history-item';
        newHistoryItem.setAttribute('data-chat-id', chatId || '');
        newHistoryItem.innerHTML = `
            <div class="history-title">${title}</div>
            <div class="history-date">Just now</div>
        `;

        // Add click listener for loading history
        newHistoryItem.addEventListener('click', () => this.loadHistory(newHistoryItem));

        // Add right-click listener for context menu
        newHistoryItem.addEventListener('contextmenu', (e) => this.showContextMenu(e, newHistoryItem));

        // Insert at the beginning
        historyContainer.insertBefore(newHistoryItem, historyContainer.firstChild);

        // Limit history to 10 items
        const allHistoryItems = historyContainer.querySelectorAll('.history-item');
        if (allHistoryItems.length > 10) {
            allHistoryItems[allHistoryItems.length - 1].remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    formatTime(time) {
        return time instanceof Date ? time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) : this.getCurrentTime();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Context menu methods
    showContextMenu(e, item) {
        e.preventDefault();
        e.stopPropagation();

        this.currentRightClickedItem = item;

        // Position context menu
        const x = e.clientX;
        const y = e.clientY;

        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.style.display = 'block';

        // Ensure context menu stays within viewport
        this.adjustContextMenuPosition();
    }

    adjustContextMenuPosition() {
        const rect = this.contextMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust horizontal position if needed
        if (rect.right > viewportWidth) {
            this.contextMenu.style.left = `${viewportWidth - rect.width - 10}px`;
        }

        // Adjust vertical position if needed
        if (rect.bottom > viewportHeight) {
            this.contextMenu.style.top = `${viewportHeight - rect.height - 10}px`;
        }
    }

    closeContextMenu(e) {
        if (!this.contextMenu.contains(e.target)) {
            this.contextMenu.style.display = 'none';
        }
    }

    // Rename dialog methods
    showRenameDialog() {
        if (!this.currentRightClickedItem) return;

        const titleElement = this.currentRightClickedItem.querySelector('.history-title');
        const currentTitle = titleElement.textContent;

        this.renameInput.value = currentTitle;
        this.renameDialog.classList.add('show');
        this.renameInput.focus();
        this.renameInput.select();

        // Hide context menu
        this.contextMenu.style.display = 'none';
    }

    hideRenameDialog() {
        this.renameDialog.classList.remove('show');
        this.currentRightClickedItem = null;
    }

    handleRenameKeyPress(e) {
        if (e.key === 'Enter') {
            this.renameChat();
        } else if (e.key === 'Escape') {
            this.hideRenameDialog();
        }
    }

    renameChat() {
        if (!this.currentRightClickedItem) return;

        const newTitle = this.renameInput.value.trim();
        if (!newTitle) return;

        const titleElement = this.currentRightClickedItem.querySelector('.history-title');
        titleElement.textContent = newTitle;

        this.hideRenameDialog();
    }

    deleteChat() {
        if (!this.currentRightClickedItem) return;

        // Get chat ID from the item
        const chatId = this.currentRightClickedItem.getAttribute('data-chat-id');

        // Remove the chat session if it exists
        if (chatId && this.chatSessions[chatId]) {
            delete this.chatSessions[chatId];
        }

        // Remove the history item
        this.currentRightClickedItem.remove();
        this.contextMenu.style.display = 'none';
        this.currentRightClickedItem = null;

        // Return to homepage
        this.returnToHomepage();
    }

    returnToHomepage() {
        // Clear current messages
        this.messagesContainer.innerHTML = '';
        this.messages = [];

        // Clear current chat ID
        this.currentChatId = null;

        // Show welcome message
        this.addWelcomeMessage();

        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Focus on input
        this.messageInput.focus();
    }
}

// Initialize the chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});

// Mobile sidebar toggle (you can add a menu button to toggle this)
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !e.target.closest('.menu-toggle')) {
        sidebar.classList.remove('active');
    }
});