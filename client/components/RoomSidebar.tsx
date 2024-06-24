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
    const { players, assignedPlayerName, setPlayers } = useSidebarStore();
    const [tab, setTab] = useState(0);
    const [word, setWord] = useState('');
    const [isWordEntryEnabled, setIsWordEntryEnabled] = useState(false);
    const [guess, setGuess] = useState('');
    const [isGuessEntryEnabled, setIsGuessEntryEnabled] = useState(false);
    const [isPrompted, setIsPrompted] = useState('');
    const [isDrawer, setIsDrawer] = useState('');
    const [isGuesser, setIsGuesser] = useState('');
    const [leaderboard, setLeaderboard] = useState<{ [key: string]: number }>({});

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

        socket?.on('update-leaderboard', (updatedLeaderboard: { [key: string]: number }) => {
            setLeaderboard(updatedLeaderboard);
        });

        socket?.on('correct-guess', ({ playerName }: { playerName: string }) => {
            if (localStorage.getItem('playerName') === playerName) {
                setIsGuessEntryEnabled(false);
                toast.success(`You guessed the correct word!`);
            }
            setLeaderboard((prevLeaderboard) => ({
                ...prevLeaderboard,
                [playerName]: (prevLeaderboard[playerName] || 0) + 1
            }));
            setIsGuesser(playerName);
        });

        socket?.on('wrong-guess', () => {
            toast.error(`Incorrect guess! Try again.`);
        });

        socket?.on('player-left', ({ playerName, players: updatedPlayers }) => {
            setLeaderboard(prev => {
                const newLeaderboard = { ...prev };
                delete newLeaderboard[playerName];
                return newLeaderboard;
            });
        });

        return () => {
            socket?.off('prompt-word-entry');
            socket?.off('word-submitted');
            socket?.off('update-leaderboard');
            socket?.off('correct-guess');
            socket?.off('wrong-guess');
            socket?.off('player-left');
        };
    }, []);

    const handleSubmitWord = () => {
        const playerName = localStorage.getItem('playerName');
        socketRef.current?.emit('submit-word', { roomID, playerName, word });
    };

    const handleSubmitGuess = () => {
        const playerName = localStorage.getItem('playerName');
        socketRef.current?.emit('guess-word', { roomID, playerName, guess });
        setGuess('');
    };

    return (
        <div className={`absolute z-[0] ${width < 768 ? "h-[250px]" : `h-[${height - 54}px]`} md:right-0 md:top-[54px] bottom-0 md:max-w-[400px] lg:max-w-[450px] w-[100%] bg-gray-300 border-l border-gray-400 overflow-auto`}>
            <div className='sticky top-0 grid grid-cols-2 border-y border-gray-400'>
                <button className={`${tab === 0 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center`} onClick={() => setTab(0)}>Guess</button>
                <button className={`${tab === 1 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center`} onClick={() => setTab(1)}>Players</button>
            </div>
            {tab === 0 ? (
                players.length < 2 ? (
                    <p className='p-2 md:p-5'>Waiting for at least 2 players...</p>
                ) : (
                    <>
                        <div className='p-2 md:p-5'>
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
                                : isGuesser === localStorage.getItem('playerName') ? <p>You have guessed the word</p> : (
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
                        <div className='sticky top-0 bg-gray-400 py-2 border-y border-gray-400 text-xl font-semibold text-center'>
                            Leaderboard
                        </div>
                        {Object.keys(leaderboard).length === 0 ? (
                            <p className='p-2 md:p-5'>No points yet</p>
                        ) : (
                            <ul className='p-2 md:p-5'>
                                {Object.entries(leaderboard).map(([player, points]) => (
                                    <li key={player}>
                                        {player.split('#')[0]} {player === assignedPlayerName && "(Me)"}: {points} {points > 1 ? "points" : "point"}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )
            ) : players.length === 0 ? <p className='p-2 md:p-5'>No players in the room</p> : (
                <ul className='p-2 md:p-5'>
                    {players.map((item, id) => (
                        <li key={id}>
                            {item.split('#')[0]} {item === assignedPlayerName && "(Me)"}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RoomSidebar;