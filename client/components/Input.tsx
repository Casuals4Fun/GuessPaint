import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { useSidebarStore } from "@/store";

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
                        <Link href='/' onClick={exit} className='py-2 rounded underline active:scale-[0.8] duration-200'>
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

interface NameProps {
    socketRef: React.MutableRefObject<Socket | null>
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
}

const ChangeName: React.FC<NameProps> = ({ socketRef, setIsEditing }) => {
    const roomID = useParams().roomID as string;

    const { assignedPlayerName } = useSidebarStore();
    const [newName, setNewName] = useState(assignedPlayerName.split('#')[0] || '');

    const handleSaveClick = () => {
        if (newName.trim() !== '') {
            socketRef.current?.emit('change-name', { roomID, oldName: assignedPlayerName, newName }, (response: {
                success: boolean;
                message?: string;
            }) => {
                if (response.success) {
                    localStorage.setItem('playerName', `${newName}#${socketRef.current?.id}`);
                    toast.success('Name changed successfully!');
                } else {
                    toast.error(response.message);
                }
                setIsEditing(false);
            });
        } else {
            toast.error('Name cannot be empty!');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-black opacity-70 fixed inset-0"></div>
            <div className='bg-white w-[95%] md:w-[500px] mx-auto rounded-lg shadow-lg overflow-hidden relative'>
                <div className="p-5 h-full flex flex-col justify-between gap-5">
                    <div className='flex items-center justify-between'>
                        <p className='w-fit'>Your name</p>
                        <input
                            className='w-[60%] outline-none border rounded-md py-2 px-1 md:px-4 text-center'
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder='John'
                        />
                    </div>
                    <div className='flex justify-between items-center'>
                        <button
                            className='py-2 rounded underline active:scale-[0.8] duration-200'
                            onClick={() => setIsEditing(false)}
                        >
                            Close
                        </button>
                        <button
                            className='bg-black text-white h-[40px] py-2 px-4 rounded active:scale-[0.8] duration-200'
                            onClick={handleSaveClick}
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { DrawingSubject, ChangeName };