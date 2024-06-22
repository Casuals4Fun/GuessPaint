import React, { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import useWindowSize from '@/utils/useWindowSize';
import { useDraw } from '@/hooks/useDraw';
import { useSidebarStore, useToolbarStore } from '@/store';
import { drawLine } from '@/utils/drawLine';
import { connectSocket } from '@/utils/connectSocket';
import RoomToolbar from './RoomToolbar';
import RoomSidebar from './RoomSidebar';
import { useParams } from 'next/navigation';

const RoomCanvas: React.FC = () => {
    const params = useParams();
    const roomID = params.roomID;

    const { width, height } = useWindowSize();
    const { brushThickness, color } = useToolbarStore();
    const { players, setPlayers, addPlayer, removePlayer, setAssignedPlayerName } = useSidebarStore();

    const socketRef = useRef(connectSocket());
    const setupCompleted = useRef(false);
    const joinedRoomRef = useRef(false);

    const { canvasRef, onMouseDown, clear } = useDraw(createLine);

    function createLine({ prevPoint, currPoint, ctx }: Draw) {
        socketRef.current.emit('draw-line', { prevPoint, currPoint, color, brushThickness });
        drawLine({ prevPoint, currPoint, ctx, color, brushThickness });
    };

    const setupSocketListeners = useCallback(() => {
        if (setupCompleted.current) {
            return () => { };
        }

        const ctx = canvasRef.current?.getContext('2d');

        if (!joinedRoomRef.current) {
            if (typeof window !== 'undefined') {
                socketRef.current.emit('join-room', { roomID, playerName: localStorage.getItem('playerName') });

                socketRef.current.on('assign-player-name', (assignedName: string) => {
                    setAssignedPlayerName(assignedName);
                    localStorage.setItem('playerName', assignedName);
                });
            }

            joinedRoomRef.current = true;
        }

        socketRef.current.on('players-in-room', (players: string[]) => {
            setPlayers(players);
        });

        socketRef.current.on('new-player', (playerName: string) => {
            addPlayer(playerName);
            const originalPlayerName = playerName.split('#')[0];
            toast.success(`${originalPlayerName} joined`);
        });

        socketRef.current.on('player-left', (playerName: string) => {
            removePlayer(playerName);
            const originalPlayerName = playerName.split('#')[0];
            toast.error(`${originalPlayerName} left`);
        });

        socketRef.current.emit('client-ready');

        socketRef.current.on('get-canvas-state', () => {
            if (!canvasRef.current?.toDataURL()) return;

            socketRef.current.emit('canvas-state', canvasRef.current.toDataURL());
        });

        socketRef.current.on('canvas-state-from-server', (state: string) => {
            const image = new Image();
            image.src = state;
            image.onload = () => {
                ctx?.drawImage(image, 0, 0);
            };
        });

        socketRef.current.on('draw-line', ({ prevPoint, currPoint, color, brushThickness }: DrawLineProps) => {
            if (!ctx) return;

            drawLine({ prevPoint, currPoint, ctx, color, brushThickness });
        });

        socketRef.current.on('clear', clear);

        setupCompleted.current = true;

        return () => {
            socketRef.current.off('new-player');
            socketRef.current.off('players-in-room');
            socketRef.current.off('player-left');
            socketRef.current.off('get-canvas-state');
            socketRef.current.off('canvas-state-from-server');
            socketRef.current.off('draw-line');
            socketRef.current.off('clear');
            setupCompleted.current = false;
        };
    }, []);

    useEffect(() => {
        const cleanup = setupSocketListeners();
        return () => {
            cleanup();
        };
    }, [setupSocketListeners]);

    console.log(players);

    return (
        <div className='relative'>
            <RoomToolbar
                clear={() => {
                    clear();
                    socketRef.current.emit('clear');
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
    );
}

export default React.memo(RoomCanvas);