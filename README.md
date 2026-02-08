# Collaborative Whiteboard

A real-time collaborative whiteboard application built with **React**, **Node.js**, **Express**, and **Socket.io**. Multiple users can draw on the same canvas simultaneously, with changes synchronized instantly across all connected clients.


## 🚀 Features

- **Real-time Collaboration**: Low-latency drawing synchronization using WebSockets.
- **Drawing Tools**:
  - **Pencil**: Freehand drawing with adjustable color and brush size.
  - **Eraser**: Remove parts of the drawing.
  - **Clear Board**: Instantly wipe the canvas for all users.
- **Undo/Redo**: Easily correct mistakes with undo and redo functionality.
- **Room Support**: Users join a default room (extensible to multiple rooms).
- **Responsive Canvas**: Automatically adjusts to window size.
- **New User Sync**: New participants receive the existing board state upon joining.

## 🛠️ Tech Stack

### Frontend
- **React**: UI library (Vite)
- **HTML5 Canvas API**: High-performance 2D drawing.
- **Socket.io Client**: Real-time bidirectional communication.

### Backend
- **Node.js & Express**: Server runtime and API framework.
- **Socket.io**: WebSocket server for event-based communication.
- **In-Memory Store**: Fast state management for active rooms.

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (Node Package Manager)

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/rrv2004/collab_whiteboard.git
cd collab_whiteboard
\`\`\`

### 2. Backend Setup
Navigate to the \`server\` directory and install dependencies:
\`\`\`bash
cd server
npm install
\`\`\`
Start the backend server:
\`\`\`bash
npm start
# Server runs on http://localhost:3001
\`\`\`

### 3. Frontend Setup
Open a new terminal, navigate to the \`client\` directory, and install dependencies:
\`\`\`bash
cd client
npm install
\`\`\`
Start the frontend development server:
\`\`\`bash
npm run dev
# Client runs on http://localhost:5173
\`\`\`

## 🔌 Socket Events

| Event Name | Direction | Description |
|------------|-----------|-------------|
| \`join-room\` | Client → Server | User joins a specific room. |
| \`draw-start\` | Client → Server | User begins a stroke. |
| \`draw-move\` | Client → Server | User continues a stroke (coordinates). |
| \`draw-end\` | Client → Server | User finishes a stroke. |
| \`clear-board\` | Client → Server | User requests to clear the board. |
| \`room-state\` | Server → Client | Sends full board history to new user. |
| \`remote-draw-move\` | Server → Client | Broadcasts drawing updates to others. |
| \`undo\` | Client → Server | User requests to undo the last action. |
| \`redo\` | Client → Server | User requests to redo the last undone action. |


## 📄 License

This project is open source and available under the [MIT License](LICENSE).
