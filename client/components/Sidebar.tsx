import React, { useEffect, useState, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import useWindowSize from '@/utils/useWindowSize'
import { useSidebarStore } from '@/store'
import Leaderboard from './Leaderboard'
import Chat from './Chat'

interface SidebarProps {
    socketRef: React.MutableRefObject<Socket | null>;
}

const Sidebar: React.FC<SidebarProps> = ({ socketRef }) => {
    const roomID = useParams().roomID as string;
    const router = useRouter();

    const { width, height } = useWindowSize();
    const { players, setPlayers, assignedPlayerName, setAssignedPlayerName } = useSidebarStore();

    const [tab, setTab] = useState(0);
    const [leaderboard, setLeaderboard] = useState<{ [key: string]: number }>({});
    const [messages, setMessages] = useState<{ playerName: string, message: string }[]>([]);
    const [isPrompted, setIsPrompted] = useState('');
    const [isGuessEntryEnabled, setIsGuessEntryEnabled] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [guessLength, setGuessLength] = useState<number>(0);
    const [guess, setGuess] = useState<string[]>(Array(guessLength).fill(''));
    const [votes, setVotes] = useState<{ [key: string]: number }>({});

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

    const handleSubmitGuess = () => {
        if (guess.join('').length < guessLength) return toast.warning('Guess the drawing subject');
        socketRef.current?.emit('guess-word', { roomID, playerName: assignedPlayerName, guess: guess.join('') });
        setGuess(Array(guessLength).fill(''));
        inputRefs.current[0]?.focus();
    };

    useEffect(() => {
        const socket = socketRef.current;

        socket?.on('assign-player-name', (assignedName: string) => {
            setAssignedPlayerName(assignedName);
            localStorage.setItem('playerName', assignedName);
        });

        socket?.on('prompt-word-entry', (playerName: string) => {
            setIsPrompted(playerName);
            setIsGuessEntryEnabled(false);
        });

        socket?.on('word-submitted', ({ playerName, wordLength }: { playerName: string, wordLength: number }) => {
            setGuessLength(wordLength);
            setGuess(Array(wordLength).fill(''));
            if (playerName === useSidebarStore.getState().assignedPlayerName) {
                toast.success('You have submitted the word');
            }
            else {
                setIsGuessEntryEnabled(true);
                toast.success(`${playerName.split('#')[0]} has submitted the word`);
            }
        });

        socket?.on('update-leaderboard', (updatedLeaderboard: { [key: string]: number }) => {
            const sortedLeaderboard = Object.fromEntries(
                Object.entries(updatedLeaderboard).sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
            );
            setLeaderboard(sortedLeaderboard);
        });

        socket?.on('correct-guess', ({ playerName, nextPlayer }: { playerName: string, nextPlayer: string }) => {
            if (useSidebarStore.getState().assignedPlayerName === playerName) {
                setIsGuessEntryEnabled(false);
                toast.success('You guessed the correct word');
            }
            else toast.success(`${playerName.split('#')[0]} guessed the correct word`);
            setIsPrompted(nextPlayer);
            setGuessLength(0);
        });

        socket?.on('wrong-guess', () => {
            toast.error(`Incorrect guess! Try again.`);
        });

        socket?.on('player-left', ({ playerName, players }) => {
            setPlayers(players || []);
            setLeaderboard(prev => {
                const newLeaderboard = { ...prev };
                delete newLeaderboard[playerName];
                return newLeaderboard;
            });
            setGuessLength(0);
        });

        socket?.on('time-up', ({ currentPlayer, drawingWord }: { currentPlayer: string, drawingWord: string }) => {
            if (useSidebarStore.getState().assignedPlayerName === currentPlayer) {
                toast.error('Time is up! Next player\'s turn.');
            }
            else {
                if (drawingWord) toast.success(`The drawing was: ${drawingWord.toUpperCase()}`);
                else toast.error(`${currentPlayer.split('#')[0]}'s time is up!`);
            }
            setGuessLength(0);
        });

        socket?.on('player-name-changed', ({ oldName, newName }: { oldName: string, newName: string }) => {
            setPlayers((prevPlayers: string[]) => {
                return prevPlayers.map((player: string) => (player === oldName ? newName : player));
            });
            setLeaderboard((prevLeaderboard: { [key: string]: number }) => {
                const newLeaderboard = { ...prevLeaderboard };
                const score = newLeaderboard[oldName];
                delete newLeaderboard[oldName];
                newLeaderboard[newName] = score;
                return newLeaderboard;
            });
            if (useSidebarStore.getState().assignedPlayerName === oldName) {
                setAssignedPlayerName(newName);
                localStorage.setItem('playerName', newName);
            }
            if (isPrompted === oldName) setIsPrompted(newName);
        });

        socket?.on('vote-initiated', ({ player, voter }) => {
            if (voter === useSidebarStore.getState().assignedPlayerName) {
                toast.success(`You have voted to kick ${player.split('#')[0]}`);
            }
            else {
                toast.success(`${voter.split('#')[0]} has voted to kick ${player === useSidebarStore.getState().assignedPlayerName ? 'you' : player.split('#')[0]}`);
            }
        });

        socket?.on('vote-progress', ({ player, votes }) => {
            setVotes(prev => ({ ...prev, [player]: votes }));
        });

        socket?.on('player-kicked', ({ player }) => {
            setVotes(prev => {
                const newVotes = { ...prev };
                delete newVotes[player];
                return newVotes;
            });
            if (player === useSidebarStore.getState().assignedPlayerName) {
                socket?.emit('leave-room');
                router.push('/', { shallow: true } as any);
                toast.error('You have been kicked from the room');
            }
            else toast.success(`${player.split('#')[0]} has been kicked from the room`);
            setGuessLength(0);
        });

        socket?.on('chat-message', (messageData: { playerName: string, message: string }) => {
            setMessages(prevMessages => [...prevMessages, messageData]);
        });

        return () => {
            socket?.off('assign-player-name');
            socket?.off('prompt-word-entry');
            socket?.off('word-submitted');
            socket?.off('update-leaderboard');
            socket?.off('correct-guess');
            socket?.off('wrong-guess');
            socket?.off('player-left');
            socket?.off('time-up');
            socket?.off('player-name-changed');
            socket?.off('vote-initiated');
            socket?.off('vote-progress');
            socket?.off('player-kicked');
            socket?.off('chat-message');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`absolute z-[0] ${width < 768 ? "h-[250px]" : `h-[${height - 54}px]`} md:right-0 md:top-[54px] bottom-0 md:max-w-[400px] lg:max-w-[450px] w-[100%] bg-gray-300 border-l border-gray-400 overflow-auto`}>
            <div className='sticky top-0 grid grid-cols-2 border-y border-gray-400'>
                <button className={`${tab === 0 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center`} onClick={() => setTab(0)}>Guess</button>
                <button className={`${tab === 1 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center relative`} onClick={() => setTab(1)}>
                    <p>Chat<span className='absolute left-[60.5%] translate-x-[60.5%] bottom-[11px] text-sm text-gray-600'>{messages.length > 0 && messages.length}</span></p>
                </button>
            </div>

            <div className='h-[calc(100%-46px)] overflow-hidden'>
                <div className='h-full overflow-auto'>
                    {tab === 0 ? (players.length === 0 ? <p className='m-2 my-5 md:m-5'>No players in the room</p> :
                        players.length < 2 ? <p className='m-2 my-5 md:m-5'>Waiting for at least 2 players...</p> : (
                            <>
                                {isGuessEntryEnabled ? (
                                    <div className='m-2 my-5 md:m-5 w-full flex flex-col gap-2 justify-between'>
                                        <div className='w-full flex flex-wrap gap-2 items-center'>
                                            {guess.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                                                    className='w-10 h-10 border border-gray-400 rounded text-center outline-none'
                                                    value={digit}
                                                    onChange={(e) => handleChange(e, index)}
                                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                                    maxLength={1}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleSubmitGuess}
                                            className="w-fit bg-black text-white py-2 px-4 rounded active:scale-90 duration-200"
                                        >
                                            Submit Guess
                                        </button>
                                    </div>
                                ) : isPrompted !== assignedPlayerName && <p className='m-2 my-5 md:m-5'>Waiting for <span className='font-semibold'>{isPrompted.split('#')[0]}</span> to submit the word...</p>}
                                <Leaderboard socketRef={socketRef} leaderboard={leaderboard} setLeaderboard={setLeaderboard} votes={votes} />
                            </>
                        )
                    ) : tab === 1 && <Chat socketRef={socketRef} messages={messages} />}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;