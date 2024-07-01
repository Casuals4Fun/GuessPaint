import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useInviteStore } from '../store'

interface UseCreateRoomReturn {
    handleRandomRoom: () => Promise<void>;
    isPlaying: boolean;
    handleCreateRoom: () => Promise<void>;
    isCreating: boolean;
    handleJoinRoom: (roomID: string) => Promise<string | number | undefined>;
    isJoining: boolean;
}

export const useRoom = (): UseCreateRoomReturn => {
    const navigate = useNavigate();
    const { setRoomType } = useInviteStore();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState<boolean>(false);

    const handleRandomRoom = async () => {
        setIsPlaying(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/random-room`, { method: 'GET' });
            const data = await response.json();

            if (data.success) {
                setRoomType("Join");
                navigate(`/${data.roomID}`);
            } else {
                setRoomType("Create");
                navigate(`/${data.roomID}`);
            }
        } catch (error) {
            setIsPlaying(false);
            console.error('Error joining room:', error);
            toast.error('Failed to join room');
        }
    };

    const handleCreateRoom = async () => {
        setIsCreating(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create-room`, { method: 'GET' });
            const data = await response.json();
            const roomID = data.roomID;

            setRoomType("Create");

            navigate(`/${roomID}`);
        } catch (error) {
            setIsCreating(false);
            console.error('Error creating room:', error);
            toast.error('Failed to create room');
        }
    };

    const handleJoinRoom = async (roomID: string) => {
        if (!roomID.length) return toast.warning("Enter Room ID to proceed");
        setIsJoining(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/join-room?roomID=${roomID}`, { method: 'GET' });
            const data = await response.json();

            if (data.success) {
                setRoomType("Join");
                navigate(`/${roomID}`);
            } else {
                setIsJoining(false);
                toast.error('No room found');
            }
        } catch (error) {
            setIsJoining(false);
            console.error('Error joining room:', error);
            toast.error('Failed to join room');
        }
    };

    return { handleRandomRoom, isPlaying, handleCreateRoom, isCreating, handleJoinRoom, isJoining };
};