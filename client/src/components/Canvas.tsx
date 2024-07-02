import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import useWindowSize from '../utils/useWindowSize'
import { useDraw } from '../hooks/useDraw'
import { useSidebarStore, useToolbarStore } from '../store'
import { drawLine } from '../utils/drawLine'
import { connectSocket } from '../utils/connectSocket'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import { DrawingSubject } from './Input'

const Canvas: React.FC = () => {
    const { roomID } = useParams();

    const { width, height } = useWindowSize();
    const { brushThickness, color } = useToolbarStore();
    const { players, setPlayers, addPlayer } = useSidebarStore();

    const socketRef = useRef(connectSocket());
    const joinedRoomRef = useRef(false);
    const [canDraw, setCanDraw] = useState(false);
    const [isWordEntryEnabled, setIsWordEntryEnabled] = useState(false);

    const { canvasRef, onMouseDown, clear } = useDraw(createLine);
    function createLine({ prevPoint, currPoint, ctx }: Draw) {
        if (canDraw) {
            socketRef.current.emit('draw-line', { prevPoint, currPoint, color, brushThickness });
            drawLine({ prevPoint, currPoint, ctx, color, brushThickness });
        }
    }

    useEffect(() => {
        const socket = socketRef.current;
        const ctx = canvasRef.current?.getContext('2d');

        if (!joinedRoomRef.current) {
            // if (typeof window !== 'undefined') {
            socket.emit('join-room', { roomID, playerName: localStorage.getItem('playerName') });
            // }
            joinedRoomRef.current = true;
        }

        socket.on('players-in-room', (players: string[]) => {
            setPlayers(players);
        });

        socket.on('new-player', (playerName: string) => {
            if (!players.includes(playerName)) {
                addPlayer(playerName);
                toast.success(`${playerName.split('#')[0]} joined`);
            }
        });

        socket.on('player-left', ({ playerName, players }) => {
            if (playerName === useSidebarStore.getState().assignedPlayerName) toast.success("Room left");
            else toast.error(`${playerName.split('#')[0]} left`);

            if (players && players.length < 2) {
                setIsWordEntryEnabled(false);
                setCanDraw(false);
                socketRef.current.emit('clear');
            }
        });

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
            if (ctx) {
                drawLine({ prevPoint, currPoint, ctx, color, brushThickness });
            }
        });

        socket.on('clear', clear);

        socket.on('prompt-word-entry', (playerName: string) => {
            setIsWordEntryEnabled(playerName === useSidebarStore.getState().assignedPlayerName);
        });

        socket.on('word-submitted', ({ playerName }) => {
            setIsWordEntryEnabled(false);
            setCanDraw(playerName === useSidebarStore.getState().assignedPlayerName);
        });

        socket.on('correct-guess', () => {
            setCanDraw(false);
            socketRef.current.emit('clear');
        });

        socket.on('time-up', () => {
            setCanDraw(false);
            socketRef.current.emit('clear');
        });

        return () => {
            socket.off('join-room');
            socket.off('assign-player-name');
            socket.off('players-in-room');
            socket.off('new-player');
            socket.off('player-left');
            socket.off('client-ready')
            socket.off('get-canvas-state');
            socket.off('canvas-state-from-server');
            socket.off('draw-line');
            socket.off('clear');
            socket.off('prompt-word-entry');
            socket.off('word-submitted');
            socket.off('correct-guess');
            socket.off('time-up');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className='relative'>
            <Toolbar
                socketRef={socketRef}
                canDraw={canDraw}
                clear={() => socketRef.current.emit('clear')}
            />

            <canvas
                id='draw'
                width={`${width}px`}
                height={`${height}px`}
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
                style={{
                    cursor: "url(https://icons.iconarchive.com/icons/github/octicons/24/pencil-16-icon.png) 0 30, crosshair"
                }}
                className={`bg-white ${!canDraw ? '!cursor-not-allowed' : ''}`}
            />

            <Sidebar socketRef={socketRef} />

            {isWordEntryEnabled && <DrawingSubject socketRef={socketRef} />}
        </div>
    );
};

export default Canvas;