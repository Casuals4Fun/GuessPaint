import { useEffect, useRef, useState } from 'react'

export const useDraw = (onDraw: ({ ctx, currPoint, prevPoint }: Draw) => void) => {
    const [mouseDown, setMouseDown] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const prevPoint = useRef<null | Point>(null);

    const onMouseDown = () => setMouseDown(true);

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    useEffect(() => {
        const canvas = canvasRef.current;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!mouseDown) return;

            let clientX, clientY;

            if (e instanceof MouseEvent) {
                clientX = e.clientX;
                clientY = e.clientY;
            } else if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                return;
            }

            const currentPoint = computePointInCanvas(clientX, clientY);

            const ctx = canvas?.getContext('2d');
            if (!ctx || !currentPoint) return;

            onDraw({ ctx, currPoint: currentPoint, prevPoint: prevPoint.current });
            prevPoint.current = currentPoint;
        };

        const handleStart = (e: MouseEvent | TouchEvent) => {
            setMouseDown(true);

            let clientX, clientY;
            if (e instanceof MouseEvent) {
                clientX = e.clientX;
                clientY = e.clientY;
            } else if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                return;
            }

            prevPoint.current = computePointInCanvas(clientX, clientY);
        };

        const handleEnd = () => {
            setMouseDown(false);
            prevPoint.current = null;
        };

        const computePointInCanvas = (clientX: number, clientY: number) => {
            const rect = canvas?.getBoundingClientRect();
            if (!rect || !canvas) return null;

            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;

            return { x, y };
        };

        canvas?.addEventListener('mousemove', handleMove);
        canvas?.addEventListener('touchmove', handleMove);
        canvas?.addEventListener('mousedown', handleStart);
        canvas?.addEventListener('touchstart', handleStart);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);

        return () => {
            canvas?.removeEventListener('mousemove', handleMove);
            canvas?.removeEventListener('touchmove', handleMove);
            canvas?.removeEventListener('mousedown', handleStart);
            canvas?.removeEventListener('touchstart', handleStart);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        }
    }, [mouseDown, onDraw]);

    return { canvasRef, onMouseDown, clear };
};