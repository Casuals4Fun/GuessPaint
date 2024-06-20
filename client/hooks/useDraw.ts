import { useEffect, useRef, useState } from "react";

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

            const ctx = canvasRef.current?.getContext('2d');
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
            const canvas = canvasRef.current;
            if (!canvas) return null;

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;

            return { x, y };
        };

        canvasRef.current?.addEventListener('mousemove', handleMove);
        canvasRef.current?.addEventListener('touchmove', handleMove);
        canvasRef.current?.addEventListener('mousedown', handleStart);
        canvasRef.current?.addEventListener('touchstart', handleStart);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);

        return () => {
            canvasRef.current?.removeEventListener('mousemove', handleMove);
            canvasRef.current?.removeEventListener('touchmove', handleMove);
            canvasRef.current?.removeEventListener('mousedown', handleStart);
            canvasRef.current?.removeEventListener('touchstart', handleStart);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        }
    }, [onDraw]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return { canvasRef, onMouseDown, clear };
};