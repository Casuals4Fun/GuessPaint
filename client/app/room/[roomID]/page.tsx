'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useInviteStore } from '@/store';
import RoomCanvas from '@/components/RoomCanvas';
import Invite from '@/components/Invite';
import PlayerName from '@/components/PlayerName';

const InviteRoom = () => {
    const params = useParams();
    const roomID = params!.roomID;

    const { playerName, roomType, setRoomID, setPreference, invite, setInvite } = useInviteStore();

    useEffect(() => {
        if (roomID) {
            setRoomID(roomID);
            setPreference("Share");
        }
    }, [roomID, setRoomID, setPreference]);

    useEffect(() => {
        if (roomType === "Create") {
            toast.success("Room created!");
            setInvite(true);
        }
        else if (roomType === "Join") {
            toast.success("Room joined!");
            setInvite(false);
        }
    }, [roomType, setInvite]);

    return (
        !playerName ? <PlayerName /> : (
            <div className='overflow-y-hidden relative w-screen flex flex-col items-center justify-between'>
                <RoomCanvas />
                {invite && <Invite />}
            </div>
        )
    )
};

export default InviteRoom