import { useState } from 'react'
import { toast } from 'sonner'

interface PlayerNameProps {
    onSavePlayerName: (name: string) => void;
}

const PlayerName: React.FC<PlayerNameProps> = ({ onSavePlayerName }) => {
    const [name, setName] = useState('');

    const handlePlayerName = () => {
        if (!name.trim()) return toast.warning("Enter your name to proceed");
        if (name.trim().length > 20) return toast.warning("Maximum 20 characters allowed");
        onSavePlayerName(name.trim());
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-70 fixed inset-0 z-40"></div>
            <div className='bg-white w-[95%] md:w-[500px] mx-auto rounded-lg shadow-lg overflow-hidden z-50 relative'>
                <div className="p-5 h-full flex flex-col justify-between gap-5">
                    <p className='text-[20px] text-center'>Guess Paint</p>
                    <div className='flex items-center justify-between'>
                        <p className='w-fit'>Your name</p>
                        <input
                            className='w-[60%] outline-none border rounded-md py-2 px-1 md:px-4 text-center'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder='John'
                        />
                    </div>
                    <div className='flex justify-end items-center'>
                        <button
                            className='bg-black text-white h-[40px] py-2 px-4 rounded active:scale-90 duration-200'
                            onClick={handlePlayerName}
                        >
                            Proceed
                        </button>
                    </div>
                </div>
                <div className='w-full h-[1px] bg-gray-200' />
                <p className='text-center text-sm p-3'>Made with ❤️ by <a href="https://github.com/Shubham-Lal" target="_blank" rel="noopener noreferrer" className='underline'>Shubham Lal</a></p>
            </div>
        </div>
    )
}

export default PlayerName;