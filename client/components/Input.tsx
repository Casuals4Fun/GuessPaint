import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

interface SubjectProps {
    socketRef: React.MutableRefObject<Socket | null>
    exit: () => void
}

const DrawingSubject: React.FC<SubjectProps> = ({ socketRef, exit }) => {
    const roomID = useParams().roomID as string;
    const [word, setWord] = useState("");

    const handleSubmitWord = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (word.trim().length < 1) return toast.warning('Enter the drawing subject');
        const playerName = localStorage.getItem('playerName');
        socketRef.current?.emit('submit-word', { roomID, playerName, word: word.trim() });
        setWord('');
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-70 fixed inset-0 z-40"></div>
            <div className='bg-white w-[95%] md:w-[500px] mx-auto rounded-lg shadow-lg overflow-hidden z-50 relative'>
                <form className="p-5 h-full flex flex-col justify-between gap-5" onSubmit={handleSubmitWord}>
                    <p className='text-[20px] text-center'>What are you drawing</p>
                    <input
                        type="text"
                        className='w-full outline-none border rounded-md py-2 px-1 md:px-4 text-center'
                        placeholder='Enter your drawing'
                        value={word}
                        onChange={e => setWord(e.target.value)}
                    />
                    <div className='flex justify-between items-center'>
                        <Link href='/' onClick={exit} className='py-2 rounded active:scale-[0.8] duration-200'>
                            Leave Room
                        </Link>
                        <button className='bg-black text-white h-[40px] py-2 px-4 rounded active:scale-[0.8] duration-200'>
                            Proceed
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DrawingSubject;