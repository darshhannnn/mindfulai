require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message'); // Import Message model
const axios = require('axios'); // Import axios

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/chatbot', require('./routes/chatbot')); // Keep for GET history
app.use('/api/reports', require('./routes/reports'));

// Socket.io connection and authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('No token, authorization denied'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.user.id;
        next();
    } catch (err) {
        console.error('Socket authentication error:', err.message);
        next(new Error('Token is not valid'));
    }
}).on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    socket.join(socket.userId); // Join the user to a room named after their ID

    socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
    });

    // Handle chat messages coming from the client via socket
    socket.on('sendMessage', async (messageText) => {
        try {
            // Save user message
            const userMessage = new Message({
                user: socket.userId,
                text: messageText,
                isUser: true,
            });
            await userMessage.save();
            io.to(socket.userId).emit('chatMessage', userMessage); // Emit user message back

            // Call OpenAI API for chatbot response
            const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: messageText }],
                max_tokens: 150,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            });

            const botText = openaiResponse.data.choices[0].message.content;

            // Save bot message
            const botMessage = new Message({
                user: socket.userId,
                text: botText,
                isUser: false,
            });
            await botMessage.save();
            io.to(socket.userId).emit('chatMessage', botMessage); // Emit bot message back

        } catch (err) {
            console.error('Error processing chat message:', err.message);
            // Emit an error message back to the user
            io.to(socket.userId).emit('chatMessage', {
                text: 'Sorry, I am having trouble responding right now. Please try again later.',
                isUser: false,
                date: new Date().toISOString(),
            });
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
