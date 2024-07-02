import { useState } from 'react'
import { Socket } from 'socket.io-client'
import { useSidebarStore } from '../store'
import { MdEdit, MdRemoveCircleOutline } from 'react-icons/md'
import { IoPerson } from 'react-icons/io5'
import { Reorder } from 'framer-motion'
import { ChangeName } from './Input'

interface LeaderboardProps {
    socketRef: React.MutableRefObject<Socket | null>;
    leaderboard: { [key: string]: number };
    setLeaderboard: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
    votes: { [key: string]: number };
}

const Leaderboard: React.FC<LeaderboardProps> = ({ socketRef, leaderboard, setLeaderboard, votes }) => {
    const { players, assignedPlayerName } = useSidebarStore();
    const [isEditing, setIsEditing] = useState(false);

    const handleKickVote = (player: string) => {
        const socket = socketRef.current;
        socket?.emit('initiate-vote-kick', { player, voter: assignedPlayerName });
    };

    const handleReorder = (newOrder: [string, number][]) => {
        const reorderedLeaderboard = Object.fromEntries(newOrder);
        setLeaderboard(reorderedLeaderboard);
    };

    return (
        <div className='px-2 py-5 md:p-5'>
            {players.length > 0 && (
                <Reorder.Group
                    as='div'
                    axis='y'
                    values={Object.entries(leaderboard)}
                    onReorder={handleReorder}
                    className='flex flex-col gap-5'
                >
                    {Object.entries(leaderboard).map(([player, points], index) => (
                        <Reorder.Item
                            as='div'
                            key={player}
                            value={[player, points]}
                        >
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <div className='flex items-center gap-1'>
                                        {
                                            index + 1 === 1 ? <img src='/first.svg' width={25} height={25} alt='first' />
                                                : index + 1 === 2 ? <img src='/second.svg' width={25} height={25} alt='second' />
                                                    : index + 1 === 3 && <img src='/third.svg' width={25} height={25} alt='third' />
                                        }
                                        <p className='font-medium'>{index + 1 > 3 && `${index + 1}.`} {player.split('#')[0]} {player === assignedPlayerName && "(Me)"}</p>
                                    </div>
                                    {player === assignedPlayerName ? (
                                        <>
                                            <button onClick={() => setIsEditing(!isEditing)}><MdEdit size={20} /></button>
                                            {isEditing && <ChangeName socketRef={socketRef} setIsEditing={setIsEditing} />}
                                        </>
                                    ) : (
                                        <>
                                            <button title='Vote Kick' onClick={() => handleKickVote(player)} className='flex items-center gap-1'>
                                                <MdRemoveCircleOutline size={20} />
                                            </button>
                                            {votes[player] ? (
                                                <span className='flex items-center'>
                                                    {Array(votes[player])
                                                        .fill(null)
                                                        .map((_, index) => (
                                                            <IoPerson key={`current-vote-${index}`} size={15} />
                                                        ))}
                                                    /
                                                    {Array(players.length - 1)
                                                        .fill(null)
                                                        .map((_, index) => (
                                                            <IoPerson key={`total-vote-${index}`} size={15} />
                                                        ))}
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                                <p className='text-gray-500'>Score: <span className='text-black font-semibold'>{points}</span></p>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            )}
        </div>
    );
};

export default Leaderboard;