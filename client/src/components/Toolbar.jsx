import React from 'react';

const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

const Toolbar = ({ color, setColor, lineWidth, setLineWidth, clearBoard, setTool, tool, undo, redo }) => {
    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            gap: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            alignItems: 'center',
            zIndex: 100 // Ensure it's above canvas
        }}>
            <div style={{ display: 'flex', gap: '5px' }}>
                {colors.map((c) => (
                    <div
                        key={c}
                        onClick={() => {
                            setColor(c);
                            setTool('pencil');
                        }}
                        style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: c,
                            borderRadius: '50%',
                            border: color === c && tool === 'pencil' ? '2px solid black' : '1px solid #ddd',
                            cursor: 'pointer'
                        }}
                    />
                ))}
            </div>

            <div style={{ borderLeft: '1px solid #ccc', height: '24px' }}></div>

            <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
            />

            <div style={{ borderLeft: '1px solid #ccc', height: '24px' }}></div>

            <button
                onClick={() => setTool('eraser')}
                style={{
                    fontWeight: tool === 'eraser' ? 'bold' : 'normal',
                    textDecoration: tool === 'eraser' ? 'underline' : 'none'
                }}
            >
                Eraser
            </button>

            <button onClick={clearBoard} style={{ color: 'red' }}>Clear</button>

            <div style={{ borderLeft: '1px solid #ccc', height: '24px' }}></div>

            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
        </div>
    );
};

export default Toolbar;
