"use client"

import React from 'react';
import useWindowSize from "@/utils/useWindowSize";
import { useSidebarStore } from "@/store";

const RoomSidebar: React.FC = () => {
    const { width, height } = useWindowSize();
    const { players, assignedPlayerName } = useSidebarStore();

    return (
        <div className={`absolute ${width < 768 ? "h-[300px]" : `h-[${height - 54}px]`} md:right-0 md:top-[54px] bottom-0 md:max-w-[400px] lg:max-w-[450px] w-[100%] md:pb-5 md:px-5 bg-gray-300 overflow-auto`}>
            <div>
                <h1 className='font-semibold text-xl text-center underline'>Players</h1>
                <div>
                    {players.length === 0 ? "No players in the room" : (
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
        </div>
    )
}

export default RoomSidebar;