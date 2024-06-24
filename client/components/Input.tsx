import { useState } from "react";
import { Socket } from "socket.io-client";

interface SubjectProps {
    socketRef: React.MutableRefObject<Socket | null>
}

const DrawingSubject: React.FC<SubjectProps> = ({ socketRef }) => {
    const [word, setWord] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        socketRef.current?.emit('submit-word', word);
        setWord("");
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-70 fixed inset-0 z-40"></div>
            <div className='bg-white w-[95%] md:w-[500px] mx-auto rounded-lg shadow-lg overflow-hidden z-50 relative'>
                <form className="p-5 h-full flex flex-col justify-between gap-5" onSubmit={handleSubmit}>
                    <p className='text-[20px] text-center'>What are you drawing</p>
                    <input
                        type="text"
                        className='w-full outline-none border rounded-md py-2 px-1 md:px-4 text-center'
                        placeholder='Enter your drawing name'
                        value={word}
                        onChange={e => setWord(e.target.value)}
                    />
                    <div className='flex justify-end items-center'>
                        <button className='bg-black hover:bg-white text-white hover:text-black duration-200 h-[40px] py-2 px-4 rounded-lg'>
                            Proceed
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DrawingSubject;