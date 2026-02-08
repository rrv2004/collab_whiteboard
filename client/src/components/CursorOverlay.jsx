import React from 'react';

const CursorOverlay = ({ cursors }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Allow clicks to pass through
            overflow: 'hidden',
            zIndex: 50 // Above canvas, below toolbar
        }}>
            {Object.entries(cursors).map(([socketId, { x, y, color, username, isDrawing }]) => (
                <div
                    key={socketId}
                    style={{
                        position: 'absolute',
                        left: x,
                        top: y,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        transition: 'left 0.1s linear, top 0.1s linear',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill={color || '#000'}
                        style={{
                            dropShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                            filter: isDrawing ? `drop-shadow(0 0 4px ${color})` : 'none',
                            transform: isDrawing ? 'scale(1.2)' : 'scale(1)',
                            transition: 'transform 0.1s'
                        }}
                    >
                        <path d="M5.5 3.21l10.22 17.7 2.72-6.57 6.32-1.9L5.5 3.21z" />
                    </svg>
                    <div style={{
                        backgroundColor: isDrawing ? color : '#333',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        marginTop: '4px',
                        whiteSpace: 'nowrap',
                        fontWeight: isDrawing ? 'bold' : 'normal',
                        opacity: 0.8
                    }}>
                        {username || `User ${socketId.substr(0, 4)}`}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CursorOverlay;
