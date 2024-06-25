import React, { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import useWindowSize from "@/utils/useWindowSize";
import { useSidebarStore } from "@/store";
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface RoomSidebarProps {
    socketRef: React.MutableRefObject<Socket | null>;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({ socketRef }) => {
    const roomID = useParams().roomID as string;

    const { width, height } = useWindowSize();
    const { players, setPlayers, assignedPlayerName } = useSidebarStore();
    const [tab, setTab] = useState(0);
    const [word, setWord] = useState('');
    const [isWordEntryEnabled, setIsWordEntryEnabled] = useState(false);
    const [guessLength, setGuessLength] = useState<number>(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [guess, setGuess] = useState<string[]>(Array(guessLength).fill(''));
    const [isGuessEntryEnabled, setIsGuessEntryEnabled] = useState(false);
    const [isPrompted, setIsPrompted] = useState('');
    const [isDrawer, setIsDrawer] = useState('');
    const [isGuesser, setIsGuesser] = useState('');
    const [leaderboard, setLeaderboard] = useState<{ [key: string]: number }>({});
    const [timeLeft, setTimeLeft] = useState(60);
    const timerIntervalRef = useRef<number | NodeJS.Timeout>();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z0-9]$/.test(value) || value === '') {
            const newGuess = [...guess];
            newGuess[index] = value;
            setGuess(newGuess);

            if (value !== '' && index < guessLength - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && guess[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmitWord = () => {
        if (word.length < 1) return toast.warning('Enter the drawing subject');
        const playerName = localStorage.getItem('playerName');
        socketRef.current?.emit('submit-word', { roomID, playerName, word });
        setWord('');
    };

    const handleSubmitGuess = () => {
        if (guess.join('').length < guessLength) return toast.warning('Guess the drawing subject');
        const playerName = localStorage.getItem('playerName');
        socketRef.current?.emit('guess-word', { roomID, playerName, guess: guess.join('') });
        setGuess(Array(guessLength).fill(''));
        inputRefs.current[0]?.focus();
    };

    useEffect(() => {
        const socket = socketRef.current;

        const startTimer = () => {
            clearInterval(timerIntervalRef.current);
            setTimeLeft(60);
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev === 1) {
                        clearInterval(timerIntervalRef.current);
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        };

        const stopTimer = () => {
            clearInterval(timerIntervalRef.current);
            setTimeLeft(60);
        };

        socket?.on('prompt-word-entry', (playerName: string) => {
            if (players.length >= 2) startTimer();
            const currentPlayerName = localStorage.getItem('playerName');
            setIsWordEntryEnabled(currentPlayerName === playerName);
            setIsPrompted(playerName);
            setIsGuessEntryEnabled(false);
        });

        socket?.on('word-submitted', ({ playerName, wordLength }) => {
            setGuessLength(wordLength);
            setGuess(Array(wordLength).fill(''));
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

        socket?.on('correct-guess', ({ playerName, nextPlayer }: { playerName: string, nextPlayer: string }) => {
            if (players.length >= 2) startTimer();
            if (localStorage.getItem('playerName') === playerName) {
                setIsGuessEntryEnabled(false);
                toast.success('You guessed the correct word');
            }
            else toast.success(`${playerName.split('#')[0]} guessed the correct word`);
            setIsGuesser(playerName);
            setIsPrompted(nextPlayer);
            setIsDrawer(nextPlayer);
        });

        socket?.on('wrong-guess', () => {
            toast.error(`Incorrect guess! Try again.`);
        });

        socket?.on('player-left', ({ playerName, players }) => {
            if (players.length < 2) stopTimer();
            setPlayers(players || []);
            setLeaderboard(prev => {
                const newLeaderboard = { ...prev };
                delete newLeaderboard[playerName];
                return newLeaderboard;
            });
        });

        socket?.on('time-up', ({ currentPlayer }: { currentPlayer: string }) => {
            if (localStorage.getItem('playerName') === currentPlayer) {
                toast.error('Time is up! Next player\'s turn.');
            } else {
                toast.error(`${currentPlayer.split('#')[0]}'s time is up!`);
            }
            if (players.length >= 2) startTimer();
        });

        return () => {
            clearInterval(timerIntervalRef.current);
            socket?.off('prompt-word-entry');
            socket?.off('word-submitted');
            socket?.off('update-leaderboard');
            socket?.off('correct-guess');
            socket?.off('wrong-guess');
            socket?.off('player-left');
            socket?.off('time-up');
        };
    }, [players]);

    return (
        <div className={`absolute z-[0] ${width < 768 ? "h-[250px]" : `h-[${height - 54}px]`} md:right-0 md:top-[54px] bottom-0 md:max-w-[400px] lg:max-w-[450px] w-[100%] bg-gray-300 border-l border-gray-400 overflow-auto`}>
            <div className='sticky top-0 grid grid-cols-2 border-y border-gray-400'>
                <button className={`${tab === 0 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center`} onClick={() => setTab(0)}>Guess</button>
                <button className={`${tab === 1 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center`} onClick={() => setTab(1)}>Players</button>
            </div>

            {tab === 0 ?
                (players.length === 0 ? <p className='p-2 md:p-5'>No players in the room</p> :
                    players.length < 2 ? <p className='p-2 md:p-5'>Waiting for at least 2 players...</p> : (
                        <>
                            <div className='p-2 md:p-5'>
                                <p className='font-bold text-center mb-4'>Time Left: {timeLeft} seconds</p>
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
                                            className="w-fit bg-black text-white py-2 px-4 rounded active:scale-[0.8] duration-200"
                                        >
                                            Submit Word
                                        </button>
                                    </div>
                                ) : isGuessEntryEnabled ? (
                                    <div className='w-full flex flex-col gap-2 justify-between'>
                                        <div className='w-full flex flex-wrap gap-2 items-center'>
                                            {guess.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                                                    className='w-10 h-10 border border-gray-400 rounded text-center outline-none'
                                                    value={digit}
                                                    onChange={(e) => handleChange(e, index)}
                                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                                    type="text"
                                                    maxLength={1}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleSubmitGuess}
                                            className="w-fit bg-black text-white py-2 px-4 rounded active:scale-[0.8] duration-200"
                                        >
                                            Submit Guess
                                        </button>
                                    </div>
                                ) : isDrawer === localStorage.getItem('playerName') ? <p>You have submitted the word</p>
                                    : isGuesser === localStorage.getItem('playerName') ? <p>You have guessed the word</p> : (
                                        <p>Waiting for {isPrompted.split('#')[0]} to submit the word...</p>
                                    )
                                }
                            </div>
                        </>
                    )
                ) : tab === 1 && (
                    <div className='p-2 md:p-5'>
                        {players.length > 0 && (
                            <div>
                                <h2 className='text-center font-semibold text-2xl mb-4'>Players</h2>
                                {Object.entries(leaderboard).map(([player, points]) => (
                                    <div key={player} className='flex items-center justify-between mb-2'>
                                        <span className='font-medium'>{player.split('#')[0]} {player === assignedPlayerName && "(Me)"}</span>
                                        <span className='text-gray-500'>Score: {points}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
};

export default React.memo(RoomSidebar);