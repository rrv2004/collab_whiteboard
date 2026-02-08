const Room = require('./models/Room');

module.exports = {
    getRoom: async (roomId) => {
        let room = await Room.findOne({ roomId });
        if (!room) {
            room = await Room.create({ roomId });
        }
        return room.strokes;
    },

    addStroke: async (roomId, stroke) => {
        let room = await Room.findOne({ roomId });
        if (!room) {
            room = await Room.create({ roomId });
        }
        room.strokes.push(stroke);
        room.redoStack = []; // Clear redo stack on new action
        await room.save();
        return stroke;
    },

    undo: async (roomId) => {
        const room = await Room.findOne({ roomId });
        if (!room || room.strokes.length === 0) return null;

        const stroke = room.strokes.pop();
        room.redoStack.push(stroke);
        await room.save();
        return stroke;
    },

    redo: async (roomId) => {
        const room = await Room.findOne({ roomId });
        if (!room || room.redoStack.length === 0) return null;

        const stroke = room.redoStack.pop();
        room.strokes.push(stroke);
        await room.save();
        return stroke;
    },

    appendPoint: async (roomId, strokeId, point) => {
        // Optimization: For highly frequent updates like draw-move, 
        // we might want to buffer or stick to memory, but for now 
        // we will update the document.
        // Using updateOne for efficiency without fetching the whole doc if possible,
        // but strokes is an array of objects, so we need to find the specific stroke.

        await Room.updateOne(
            { roomId, "strokes.id": strokeId },
            { $push: { "strokes.$.points": point } }
        );
    },

    clearRoom: async (roomId) => {
        await Room.updateOne(
            { roomId },
            { $set: { strokes: [], redoStack: [] } }
        );
    },
};
