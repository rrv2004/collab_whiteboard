import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const URL = 'http://localhost:3001';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketIo = io(URL);

        socketIo.on('connect', () => {
            setIsConnected(true);
        });

        socketIo.on('disconnect', () => {
            setIsConnected(false);
        });

        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, []);

    return { socket, isConnected };
};
