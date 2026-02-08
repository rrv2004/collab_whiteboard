const roomStore = require('./roomStore');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', async (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);

            // Send existing room state to the new user
            const roomState = await roomStore.getRoom(roomId);
            socket.emit('room-state', roomState);
        });

        socket.on('draw-start', async ({ roomId, stroke }) => {
            // Add stroke to store
            const newStroke = await roomStore.addStroke(roomId, stroke);
            // Broadcast to others in the room
            socket.to(roomId).emit('remote-draw-start', newStroke);
        });

        socket.on('draw-move', async ({ roomId, strokeId, point }) => {
            // Ideally we would update the stroke in the store here too, 
            // but for performance optimizations we might just broadcast moves 
            // and only save the full stroke at the end, or append points.
            // For this implementation, we'll append points to the stroke in memory.
            await roomStore.appendPoint(roomId, strokeId, point);

            socket.to(roomId).emit('remote-draw-move', { strokeId, point });
        });

        socket.on('draw-end', ({ roomId, strokeId }) => {
            socket.to(roomId).emit('remote-draw-end', strokeId);
        });

        socket.on('clear-board', async (roomId) => {
            await roomStore.clearRoom(roomId);
            io.to(roomId).emit('board-cleared');
        });

        socket.on('undo', async (roomId) => {
            await roomStore.undo(roomId);
            io.to(roomId).emit('room-state', await roomStore.getRoom(roomId));
        });

        socket.on('redo', async (roomId) => {
            await roomStore.redo(roomId);
            io.to(roomId).emit('room-state', await roomStore.getRoom(roomId));
        });

        socket.on('cursor-move', ({ roomId, cursor }) => {
            // Broadcast cursor position to others in the room
            // Limit payload size if necessary
            socket.to(roomId).emit('remote-cursor-move', { socketId: socket.id, cursor });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
