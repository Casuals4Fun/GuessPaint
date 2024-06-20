import { useState } from "react";
import { useInviteStore } from "@/store";
import { toast } from "sonner";

const PlayerName = () => {
    const [name, setName] = useState('');
    const { setPlayerName } = useInviteStore();

    const handlePlayerName = () => {
        if (!name.trim()) return toast.warning("Enter your name to proceed!");
        setPlayerName(name)
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-70 fixed inset-0 z-40"></div>
            <div className={`bg-white w-[95%] md:w-[500px] h-[214px] mx-auto rounded-lg shadow-lg overflow-hidden z-50 relative`}>
                <div className="p-5 h-full flex flex-col justify-between">
                    <p className='text-[20px] text-center'>
                        Player Name
                    </p>
                    <div className='flex items-center justify-between'>
                        <div className='w-[40%]'>
                            Enter your name
                        </div>
                        <div className='w-[60%]'>
                            <input
                                className='w-full outline-none border rounded-md py-2 px-1 md:px-4 text-center'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder='John'
                            />
                        </div>
                    </div>
                    <div className='w-full h-[1px] bg-gray-200' />
                    <div className='flex justify-end items-center'>
                        <button
                            className='bg-black hover:bg-white text-white hover:text-black duration-200"} h-[40px] py-2 px-4 rounded-lg'
                            onClick={handlePlayerName}
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerName