import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useWindowSize from '@/utils/useWindowSize'
import { useDraw } from '@/hooks/useDraw'
import { useSidebarStore, useToolbarStore } from '@/store'
import { drawLine } from '@/utils/drawLine'
import { connectSocket } from '@/utils/connectSocket'
import RoomToolbar from './RoomToolbar'
import RoomSidebar from './RoomSidebar'
import { DrawingSubject } from './Input'

const RoomCanvas: React.FC = () => {
    const roomID = useParams().roomID as string;

    const { width, height } = useWindowSize();
    const { brushThickness, color } = useToolbarStore();
    const { players, setPlayers, addPlayer, setAssignedPlayerName } = useSidebarStore();

    const socketRef = useRef(connectSocket());
    const setupCompleted = useRef(false);
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
        let cleanupFunction = () => { };

        if (setupCompleted.current) return;

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
            if (!players.includes(playerName)) {
                addPlayer(playerName);
                toast.success(`${playerName.split('#')[0]} joined`);
            }
        });

        socketRef.current.on('player-left', ({ playerName, players }) => {
            if (playerName === localStorage.getItem('playerName')) toast.success("Room left");
            else toast.error(`${playerName.split('#')[0]} left`);

            if (players && players.length < 2) {
                setIsWordEntryEnabled(false);
                setCanDraw(false);
                clear();
                socketRef.current.emit('clear');
            }
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
            if (ctx) {
                drawLine({ prevPoint, currPoint, ctx, color, brushThickness });
            }
        });

        socketRef.current.on('clear', clear);

        socketRef.current.on('prompt-word-entry', (playerName: string) => {
            const currentPlayerName = localStorage.getItem('playerName');
            setIsWordEntryEnabled(currentPlayerName === playerName);
        });

        socketRef.current.on('word-submitted', ({ playerName, wordLength }) => {
            setIsWordEntryEnabled(false);
            setCanDraw(playerName === localStorage.getItem('playerName'));
        });

        socketRef.current.on('correct-guess', () => {
            setCanDraw(false);
            clear();
            socketRef.current.emit('clear');
        });

        socketRef.current.on('time-up', () => {
            setCanDraw(false);
            clear();
            socketRef.current.emit('clear');
        });

        setupCompleted.current = true;

        cleanupFunction = () => {
            socketRef.current.off('join-room');
            socketRef.current.off('assign-player-name');
            socketRef.current.off('players-in-room');
            socketRef.current.off('new-player');
            socketRef.current.off('player-left');
            socketRef.current.off('client-ready')
            socketRef.current.off('get-canvas-state');
            socketRef.current.off('canvas-state-from-server');
            socketRef.current.off('draw-line');
            socketRef.current.off('clear');
            socketRef.current.off('prompt-word-entry');
            socketRef.current.off('word-submitted');
            socketRef.current.off('correct-guess');
            socketRef.current.off('time-up');
            setupCompleted.current = false;
        };

        return cleanupFunction;
    }, []);

    return (
        <div className='relative'>
            <RoomToolbar
                canDraw={canDraw}
                clear={() => {
                    clear();
                    socketRef.current.emit('clear');
                }}
                exit={() => socketRef.current.emit('leave-room')}
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

            <RoomSidebar socketRef={socketRef} />

            {isWordEntryEnabled && (
                <DrawingSubject
                    socketRef={socketRef}
                    exit={() => socketRef.current.emit('leave-room')}
                />
            )}
        </div>
    );
};

export default React.memo(RoomCanvas);