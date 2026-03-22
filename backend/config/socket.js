const { Server } = require('socket.io');
const logger = require('../utils/logger');
const { getRedis } = require('./redis');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // Join show room for real-time seat updates
        socket.on('join_show', (showId) => {
            socket.join(`show_${showId}`);
            logger.info(`Socket ${socket.id} joined show room: ${showId}`);
        });

        socket.on('leave_show', (showId) => {
            socket.leave(`show_${showId}`);
        });

        // User selects a seat (temporary UI highlight, not locked)
        socket.on('seat_hover', ({ showId, seatId, userId }) => {
            socket.to(`show_${showId}`).emit('seat_hovered', { seatId, userId });
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

module.exports = { initSocket, getIO };
