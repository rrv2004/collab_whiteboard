import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useDraw } from '../hooks/useDraw';
import Toolbar from './Toolbar';
import CursorOverlay from './CursorOverlay';
import { v4 as uuidv4 } from 'uuid';
import throttle from 'lodash.throttle';

const Canvas = ({ roomId, username }) => {
    const { socket } = useSocket();
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);
    const [tool, setTool] = useState('pencil'); // 'pencil' or 'eraser'

    // State for remote cursors
    const [cursors, setCursors] = useState({});

    // Throttled cursor emitter
    const emitCursorMove = useRef(
        throttle((point, socketInstance) => {
            if (socketInstance) {
                socketInstance.emit('cursor-move', {
                    roomId, // Use dynamic roomId
                    cursor: { x: point.x, y: point.y, color, username, isDrawing: !!currentStrokeId.current }
                });
            }
        }, 50) // 20 times per second max
    ).current;

    // State to track current stroke ID for this user
    const currentStrokeId = useRef(null);

    const drawLine = ({ ctx, currentPoint, prevPoint, strokeColor, strokeWidth }) => {
        const { x: currX, y: currY } = currentPoint;
        const { x: prevX, y: prevY } = prevPoint;

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
    };

    const { canvasRef, onMouseDown, onMouseMove: drawMouseMove, onMouseUp } = useDraw(
        // onDraw
        ({ ctx, currentPoint, prevPoint }) => {
            const strokeColor = tool === 'eraser' ? '#FFFFFF' : color;
            drawLine({ ctx, currentPoint, prevPoint, strokeColor, strokeWidth: lineWidth });

            // Emit draw move
            if (socket && currentStrokeId.current) {
                socket.emit('draw-move', {
                    roomId,
                    strokeId: currentStrokeId.current,
                    point: currentPoint
                });
            }
        },
        // onDrawStart
        (startPoint) => {
            const id = uuidv4();
            currentStrokeId.current = id;
            const strokeColor = tool === 'eraser' ? '#FFFFFF' : color;

            if (socket) {
                socket.emit('draw-start', {
                    roomId,
                    stroke: {
                        id,
                        color: strokeColor,
                        width: lineWidth,
                        tool,
                        points: [startPoint]
                    }
                });
            }
        },
        // onDrawEnd
        () => {
            if (socket && currentStrokeId.current) {
                socket.emit('draw-end', {
                    roomId,
                    strokeId: currentStrokeId.current
                });
                currentStrokeId.current = null;
            }
        }
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        const handleResize = () => {
            // Resizing clears canvas, so we needs to ideally redraw.
            // For now MVP, just resize (it will clear content, which is a known canvas behavior)
            // A robust app would store local state of all strokes and redraw.
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                // Trigger a re-fetch of room state or redraw from local store if validation fails
                // But detailed re-draw on resize is 'nice to have'
                // For now, let's just ask server for state again to redraw
                socket?.emit('join-room', roomId);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [socket, roomId]); // Only run once on mount

    // Wrap onMouseMove to capture cursor position even when not drawing?
    // useDraw's onMouseMove only fires when drawing if we use the returned one directly for drawing.
    // But we want to see cursors always.
    // So we should attach a separate listener or use useDraw differently.
    // For now, let's attach a separate global mouse move listener to the canvas container or canvas itself.

    useEffect(() => {
        if (!socket) return;

        socket.emit('join-room', roomId);

        socket.on('room-state', (strokes) => {
            const ctx = canvasRef.current?.getContext('2d');
            if (!ctx) return;

            // Clear canvas first
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            strokes.forEach(stroke => {
                if (stroke.points.length > 0) {
                    // Replay the stroke
                    const strokeColor = stroke.color;
                    const strokeWidth = stroke.width;

                    // Draw line segments
                    for (let i = 1; i < stroke.points.length; i++) {
                        const prevPoint = stroke.points[i - 1];
                        const currentPoint = stroke.points[i];
                        drawLine({ ctx, currentPoint, prevPoint, strokeColor, strokeWidth });
                    }
                }
            });
        });

        socket.on('remote-draw-start', (stroke) => {
            // We don't need to do anything visual for start, just prepare if we were storing state
            // But for real-time, we just wait for moves
        });

        socket.on('remote-draw-move', ({ strokeId, point }) => {
            // This is tricky. We receive a SINGLE point. 
            // We need the PREVIOUS point to draw a line.
            // We need a local store of "active remote strokes" to know the previous point.

            // Let's implement a simple closure-based store or ref for active remote strokes
            // handled in a separate useEffect or via a ref available here.
        });

        socket.on('remote-cursor-move', ({ socketId, cursor }) => {
            setCursors(prev => ({
                ...prev,
                [socketId]: cursor
            }));
        });

        socket.on('board-cleared', () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        });

        return () => {
            socket.off('room-state');
            socket.off('remote-draw-start');
            socket.off('remote-draw-move');
            socket.off('remote-cursor-move');
            socket.off('board-cleared');
        };
    }, [socket]); // Re-run when socket connects

    // Separate effect to handle remote drawing state to avoid stale closures if we used the above effect
    // Actually, we can use a ref to store 'remoteStrokes' { [id]: lastPoint }

    const remoteStrokes = useRef({});

    useEffect(() => {
        if (!socket) return;

        const handleRemoteStart = (stroke) => {
            remoteStrokes.current[stroke.id] = stroke.points[0];
        };

        const handleRemoteMove = ({ strokeId, point }) => {
            const prevPoint = remoteStrokes.current[strokeId];
            if (prevPoint) {
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) {
                    // We need to know color/width. 
                    // Problem: remote-draw-move doesn't have color/width. 
                    // Solution: store color/width in remoteStrokes from draw-start.
                }
            }
            // Wait, we need to fetch info from start event.
        };

        const handleRemoteEnd = (strokeId) => {
            delete remoteStrokes.current[strokeId];
        };

        socket.on('remote-draw-start', (stroke) => {
            remoteStrokes.current[stroke.id] = {
                lastPoint: stroke.points[0],
                color: stroke.color,
                width: stroke.width
            };
        });

        socket.on('remote-draw-move', ({ strokeId, point }) => {
            const strokeData = remoteStrokes.current[strokeId];
            if (strokeData && strokeData.lastPoint) {
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) {
                    drawLine({
                        ctx,
                        currentPoint: point,
                        prevPoint: strokeData.lastPoint,
                        strokeColor: strokeData.color,
                        strokeWidth: strokeData.width
                    });
                }
                strokeData.lastPoint = point;
            }
        });

        socket.on('remote-draw-end', (strokeId) => {
            delete remoteStrokes.current[strokeId];
        });

        return () => {
            socket.off('remote-draw-start');
            socket.off('remote-draw-move');
            socket.off('remote-draw-end');
        }
    }, [socket]);

    const clearBoard = () => {
        if (socket) {
            socket.emit('clear-board', roomId);
        }
    };

    const undo = () => {
        if (socket) socket.emit('undo', roomId);
    };

    const redo = () => {
        if (socket) socket.emit('redo', roomId);
    };

    return (
        <>
            <CursorOverlay cursors={cursors} />
            <Toolbar
                color={color}
                setColor={setColor}
                lineWidth={lineWidth}
                setLineWidth={setLineWidth}
                clearBoard={clearBoard}
                tool={tool}
                setTool={setTool}
                undo={undo}
                redo={redo}
            />
            <canvas
                onMouseDown={onMouseDown}
                onMouseMove={(e) => {
                    drawMouseMove(e);
                    // Also emit cursor
                    // We need coords. logic from useDraw is internal.
                    // Let's just calculate it again or expose it from useDraw.
                    // Simpler: just calculate here.
                    const rect = canvasRef.current.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    emitCursorMove({ x, y }, socket);
                }}
                onMouseUp={onMouseUp}
                ref={canvasRef}
                style={{ touchAction: 'none' }} // Crucial for touch support
            />
        </>
    );
};

export default Canvas;
