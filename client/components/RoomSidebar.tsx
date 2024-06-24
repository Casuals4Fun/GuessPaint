import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import useWindowSize from "@/utils/useWindowSize";
import { useSidebarStore } from "@/store";
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface RoomSidebarProps {
    socketRef: React.MutableRefObject<Socket | null>;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({ socketRef }) => {
    const roomID = useParams().roomID;

    const { width, height } = useWindowSize();
    const { players, assignedPlayerName } = useSidebarStore();
    const [tab, setTab] = useState(0);
    const [word, setWord] = useState('');
    const [isWordEntryEnabled, setIsWordEntryEnabled] = useState(false);
    const [guess, setGuess] = useState('');
    const [isGuessEntryEnabled, setIsGuessEntryEnabled] = useState(false);
    const [isPrompted, setIsPrompted] = useState('');
    const [isDrawer, setIsDrawer] = useState('');

    useEffect(() => {
        const socket = socketRef.current;

        socket?.on('prompt-word-entry', (playerName: string) => {
            const currentPlayerName = localStorage.getItem('playerName');
            setIsWordEntryEnabled(currentPlayerName === playerName);
            setIsPrompted(playerName);
        });

        socket?.on('word-submitted', ({ playerName }: { playerName: string }) => {
            const assignedName = localStorage.getItem('playerName');
            if (playerName === assignedName) {
                setIsWordEntryEnabled(false);
                setIsGuessEntryEnabled(false);
                toast.success(`You have submitted the word.`);
            } else {
                setIsWordEntryEnabled(false);
                setIsGuessEntryEnabled(true);
            }
            setIsDrawer(playerName);
        });

        return () => {
            socket?.off('prompt-word-entry');
            socket?.off('word-submitted');
        };
    }, []);

    const handleSubmitWord = () => {
        const playerName = localStorage.getItem('playerName');
        socketRef.current?.emit('submit-word', { roomID, playerName, word });
    };

    const handleSubmitGuess = () => {
        const playerName = localStorage.getItem('playerName');
        socketRef.current?.emit('submit-guess', { roomID, playerName, guess });
        setGuess('');
    };

    return (
        <div className={`absolute z-[0] ${width < 768 ? "h-[250px]" : `h-[${height - 54}px]`} md:right-0 md:top-[54px] bottom-0 md:max-w-[400px] lg:max-w-[450px] w-[100%] bg-gray-300 border-l border-gray-400 overflow-auto`}>
            <div className='sticky top-0 grid grid-cols-2 border-y border-gray-400'>
                <button className={`${tab === 0 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center`} onClick={() => setTab(0)}>Guess</button>
                <button className={`${tab === 1 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center`} onClick={() => setTab(1)}>Players</button>
            </div>
            <div className='p-2 md:p-5'>
                {tab === 0 ? (
                    <div>
                        {players.length < 2 ? (
                            <p>Waiting for at least 2 players...</p>
                        ) : (
                            <div>
                                {isWordEntryEnabled ? (
                                    <div className='w-full flex flex-wrap gap-2 items-center justify-between'>
                                        <input
                                            type="text"
                                            value={word}
                                            onChange={(e) => setWord(e.target.value)}
                                            placeholder="Enter your word..."
                                            className="w-full outline-none border p-2 rounded"
                                        />
                                        <button
                                            onClick={handleSubmitWord}
                                            className="bg-black text-white py-2 px-4 rounded hover:bg-transparent hover:text-black"
                                        >
                                            Submit Word
                                        </button>
                                    </div>
                                ) : isDrawer === localStorage.getItem('playerName') ? <p>You have submitted the word</p>
                                    : (
                                        isGuessEntryEnabled ? (
                                            <div className='w-full flex flex-wrap gap-2 items-center justify-between'>
                                                <input
                                                    type="text"
                                                    value={guess}
                                                    onChange={(e) => setGuess(e.target.value)}
                                                    placeholder="Your guess..."
                                                    className="w-full outline-none border p-2 rounded"
                                                />
                                                <button
                                                    onClick={handleSubmitGuess}
                                                    className="bg-black text-white py-2 px-4 rounded hover:bg-transparent hover:text-black"
                                                >
                                                    Submit Guess
                                                </button>
                                            </div>
                                        ) : (
                                            <p>Waiting for {isPrompted.split('#')[0]} to submit the word...</p>
                                        )
                                    )}
                            </div>
                        )}
                    </div>
                ) : players.length === 0 ? "No players in the room" : (
                    <ul>
                        {players.map((item, id) => (
                            <li key={id}>
                                {item.split('#')[0]} {item === assignedPlayerName && "(Me)"}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RoomSidebar;