import { useState, useRef, useEffect, useCallback } from 'react';

export const useDraw = (onDraw, onDrawStart, onDrawEnd) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);
    const prevPoint = useRef(null);

    const onMouseDown = useCallback((e) => {
        setIsDrawing(true);
        const { offsetX, offsetY } = getCoordinates(e, canvasRef.current);
        prevPoint.current = { x: offsetX, y: offsetY };
        if (onDrawStart) onDrawStart(prevPoint.current);
    }, [onDrawStart]);

    const onMouseMove = useCallback((e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(e, canvasRef.current);
        const currentPoint = { x: offsetX, y: offsetY };

        const ctx = canvasRef.current?.getContext('2d');
        if (onDraw && ctx && prevPoint.current) {
            onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });
        }
        prevPoint.current = currentPoint;
    }, [isDrawing, onDraw]);

    const onMouseUp = useCallback(() => {
        setIsDrawing(false);
        if (onDrawEnd) onDrawEnd();
        prevPoint.current = null;
    }, [onDrawEnd]);

    // Touch support
    const onTouchStart = useCallback((e) => {
        e.preventDefault(); // Prevent scrolling
        setIsDrawing(true);
        const { offsetX, offsetY } = getCoordinates(e.touches[0], canvasRef.current);
        prevPoint.current = { x: offsetX, y: offsetY };
        if (onDrawStart) onDrawStart(prevPoint.current);
    }, [onDrawStart]);

    const onTouchMove = useCallback((e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(e.touches[0], canvasRef.current);
        const currentPoint = { x: offsetX, y: offsetY };

        const ctx = canvasRef.current?.getContext('2d');
        if (onDraw && ctx && prevPoint.current) {
            onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });
        }
        prevPoint.current = currentPoint;
    }, [isDrawing, onDraw]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const mouseUpHandler = () => {
            setIsDrawing(false);
            if (onDrawEnd) onDrawEnd();
            prevPoint.current = null;
        };

        canvas.addEventListener('mouseup', mouseUpHandler);
        canvas.addEventListener('mouseleave', mouseUpHandler);
        // We attach touch listeners directly to canvas in the component or via ref callback 
        // but standard event listeners are cleaner here if we want to support passive: false
        // React synthetic events are passive by default which breaks e.preventDefault() for touch.
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', mouseUpHandler);

        return () => {
            canvas.removeEventListener('mouseup', mouseUpHandler);
            canvas.removeEventListener('mouseleave', mouseUpHandler);
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('touchend', mouseUpHandler);
        }
    }, [onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove]);

    return {
        canvasRef,
        onMouseDown,
        onMouseMove,
        onMouseUp // Kept for consistency, though handled via useEffect for cleanup safety
    };
};

const getCoordinates = (event, canvas) => {
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    // Use clientX/Y for touch, or native event offsetX/Y if available
    const clientX = event.clientX;
    const clientY = event.clientY;

    return {
        offsetX: clientX - rect.left,
        offsetY: clientY - rect.top
    };
}
