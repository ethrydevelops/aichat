let io;
let userSockets = new Map(); // Map to store accountId -> Set of socket IDs

const setSocketInstance = (socketInstance) => {
    io = socketInstance;
};

const getSocketInstance = () => {
    if (!io) {
        throw new Error('Socket.IO instance not initialized');
    }
    return io;
};

const addUserSocket = (accountId, socketId) => {
    if (!userSockets.has(accountId)) {
        userSockets.set(accountId, new Set());
    }
    userSockets.get(accountId).add(socketId);
};

const removeUserSocket = (accountId, socketId) => {
    if (userSockets.has(accountId)) {
        userSockets.get(accountId).delete(socketId);
        if (userSockets.get(accountId).size === 0) {
            userSockets.delete(accountId);
        }
    }
};

const emitToUser = (accountId, event, data) => {
    if (userSockets.has(accountId)) {
        const socketIds = userSockets.get(accountId);
        socketIds.forEach(socketId => {
            io.to(socketId).emit(event, data);
        });
    }
};

module.exports = { 
    setSocketInstance, 
    getSocketInstance, 
    addUserSocket, 
    removeUserSocket, 
    emitToUser 
};