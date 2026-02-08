import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Canvas from './components/Canvas';
import LandingPage from './components/LandingPage';
import './index.css';

const RoomWrapper = ({ username }) => {
  const { roomId } = useParams();
  return <Canvas roomId={roomId} username={username} />;
};

function App() {
  const [username, setUsername] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage setUsername={setUsername} />} />
        <Route path="/room/:roomId" element={<RoomWrapper username={username} />} />
      </Routes>
    </Router>
  );
}

export default App;
