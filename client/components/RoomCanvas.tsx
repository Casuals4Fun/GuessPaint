"use client"

import React, { useEffect } from 'react';
import useWindowSize from '@/utils/useWindowSize';
import { useDraw } from '@/hooks/useDraw';
import { useInviteStore, useSocketStore, useToolbarStore } from '@/store';
import { drawLine } from '@/utils/drawLine';
import { connectSocket } from '@/utils/connectSocket';
import RoomToolbar from './RoomToolbar';
import RoomSidebar from './RoomSidebar';

const RoomCanvas = () => {
    const { width, height } = useWindowSize();
    const { roomID } = useInviteStore();
    const { brushThickness, color } = useToolbarStore();
    const { setConnected } = useSocketStore();
    const socket = connectSocket(setConnected);

    const { canvasRef, onMouseDown, clear } = useDraw(createLine);
    function createLine({ prevPoint, currPoint, ctx }: Draw) {
        socket.emit('draw-line', ({ prevPoint, currPoint, color, brushThickness }));
        drawLine({ prevPoint, currPoint, ctx, color, brushThickness });
    };

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');

        socket.emit('join-room', roomID);

        socket.emit('client-ready');

        socket.on('get-canvas-state', () => {
            if (!canvasRef.current?.toDataURL()) return;

            socket.emit('canvas-state', canvasRef.current.toDataURL());
        });

        socket.on('canvas-state-from-server', (state: string) => {
            const image = new Image();
            image.src = state;
            image.onload = () => {
                ctx?.drawImage(image, 0, 0);
            };
        });

        socket.on('draw-line', ({ prevPoint, currPoint, color, brushThickness }: DrawLineProps) => {
            if (!ctx) return;

            drawLine({ prevPoint, currPoint, ctx, color, brushThickness });
        });

        socket.on('clear', clear);

        return () => {
            socket.off('get-canvas-state');
            socket.off('canvas-state-from-server');
            socket.off('draw-line');
            socket.off('clear');
        }
    }, [canvasRef, socket, roomID, clear]);

    return (
        <div className='relative'>
            <RoomToolbar
                clear={() => {
                    clear();
                    socket.emit('clear');
                }}
            />

            <canvas
                id='draw'
                width={`${width}px`}
                height={`${height}px`}
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
                style={{ 
                    background: '#FFF',
                    cursor: "url(https://icons.iconarchive.com/icons/github/octicons/24/pencil-16-icon.png) 0 30, crosshair"
                 }}
            />

            <RoomSidebar />
        </div>
    )
}

export default RoomCanvas