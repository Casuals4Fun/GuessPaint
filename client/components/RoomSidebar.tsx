"use client"

import useWindowSize from "@/utils/useWindowSize";

const RoomSidebar = () => {
    const { height } = useWindowSize();

    return (
        <div className={`absolute bottom-0 h-[300px] md:h-[${height - 54}px] md:right-0 md:top-[54px] md:max-w-[400px] lg:max-w-[450px] w-[100%] md:pb-5 md:px-5 bg-gray-300 overflow-auto`}>
            <h1 className='font-semibold text-xl text-center underline'>Guess</h1>
            <h1 className='font-semibold text-xl text-center underline'>Players</h1>
        </div>
    )
}

export default RoomSidebar