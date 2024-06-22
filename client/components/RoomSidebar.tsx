import React, { useState } from 'react';
import useWindowSize from "@/utils/useWindowSize";
import { useSidebarStore } from "@/store";
import { Socket } from 'socket.io-client';

interface RoomSidebarProps {
    socketRef: React.MutableRefObject<Socket | null>;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({ socketRef }) => {
    const { width, height } = useWindowSize();
    const { players, assignedPlayerName } = useSidebarStore();
    const [tab, setTab] = useState(0);

    return (
        <div className={`absolute ${width < 768 ? "h-[250px]" : `h-[${height - 54}px]`} md:right-0 md:top-[54px] bottom-0 md:max-w-[400px] lg:max-w-[450px] w-[100%] bg-gray-300 border-l border-gray-400 overflow-auto`}>
            <div className='sticky top-0 grid grid-cols-2 border-y border-gray-400'>
                <button className={`${tab === 0 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center`} onClick={() => setTab(0)}>Guess</button>
                <button className={`${tab === 1 ? "bg-gray-400" : "bg-gray-300"} py-2 font-semibold text-xl text-center`} onClick={() => setTab(1)}>Players</button>
            </div>
            <div className='md:py-3 md:px-5'>
                {tab === 0 ? (
                    <div>
                        {players.length < 2 ? (
                            <p>Waiting for atleast 2 players...</p>
                        ) : (
                            <div>Guess box</div>
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
    )
}

export default RoomSidebar;