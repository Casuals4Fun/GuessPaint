import { useState } from "react";
import { useParams } from "next/navigation";
import { Socket } from "socket.io-client";
import { useSidebarStore } from "@/store";
import { MdEdit, MdRemoveCircleOutline } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { ChangeName } from "./Input";

interface LeaderboardProps {
    socketRef: React.MutableRefObject<Socket | null>;
    leaderboard: { [key: string]: number };
    votes: { [key: string]: number };
}

const Leaderboard: React.FC<LeaderboardProps> = ({ socketRef, leaderboard, votes }) => {
    const roomID = useParams().roomID as string;
    const { players, assignedPlayerName } = useSidebarStore();
    const [isEditing, setIsEditing] = useState(false);

    const handleKickVote = (player: string) => {
        const socket = socketRef.current;
        socket?.emit('initiate-vote-kick', { roomID, player, voter: assignedPlayerName });
    };

    return (
        <div className='p-2 md:p-5'>
            {players.length > 0 && (
                Object.entries(leaderboard).map(([player, points]) => (
                    <div key={player} className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                            <p className='font-medium'>{player.split('#')[0]} {player === assignedPlayerName && "(Me)"}</p>
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
                        <p className='text-gray-500'>Score: {points}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default Leaderboard