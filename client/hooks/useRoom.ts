import { useState } from 'react';
import { useRouter } from 'next/navigation'
import { useInviteStore } from '@/store';
import { toast } from 'sonner';

interface UseCreateRoomReturn {
    handleCreateRoom: () => Promise<void>;
    isCreating: boolean;
}

export const useRoom = (): UseCreateRoomReturn => {
    const router = useRouter();
    const { setRoomType } = useInviteStore();
    const [isCreating, setIsCreating] = useState<boolean>(false);

    const handleCreateRoom = async () => {
        setIsCreating(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create-room`, { method: 'GET' });
            const data = await response.json();
            const roomID = data.roomID;

            setRoomType("Create");

            router.push(`/room/${roomID}`, { shallow: true } as any);
        } catch (error) {
            setIsCreating(false);
            console.error('Error getting room:', error);
            toast.error('Failed to get room.');
        }
    };

    return { handleCreateRoom, isCreating };
};