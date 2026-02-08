import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const LandingPage = ({ setUsername }) => {
    const [roomId, setRoomId] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleJoin = (targetRoomId) => {
        if (!name.trim()) {
            alert('Please enter a username');
            return;
        }
        setUsername(name);
        navigate(`/room/${targetRoomId}`);
    };

    const createRoom = () => {
        const newRoomId = uuidv4();
        handleJoin(newRoomId);
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            handleJoin(roomId);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'sans-serif'
        }}>
            <h1>Collaborative Whiteboard</h1>

            <input
                type="text"
                placeholder="Enter Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    marginBottom: '20px',
                    width: '200px',
                    textAlign: 'center'
                }}
            />

            <button
                onClick={createRoom}
                style={{
                    padding: '10px 20px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                Create New Room
            </button>

            <form onSubmit={joinRoom} style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Join
                </button>
            </form>
        </div>
    );
};

export default LandingPage;
