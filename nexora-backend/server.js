require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const initChatSocket = require('./sockets/chatSocket');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const bidRoutes = require('./routes/bids');
const orderRoutes = require('./routes/orders');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);

// ── CORS: allow your frontend to call this API ──
app.use(cors());
app.use(express.json());

// ── Socket.io, same CORS rule ──
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' },
});
initChatSocket(io);

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'Nexora API is running' });
});

// ── Basic error handler for anything that slips through ──
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Nexora backend running on port ${PORT}`);
  });
});
