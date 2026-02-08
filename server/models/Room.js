const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    strokes: {
        type: Array, // Could be more specific schema if needed
        default: []
    },
    redoStack: {
        type: Array,
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
