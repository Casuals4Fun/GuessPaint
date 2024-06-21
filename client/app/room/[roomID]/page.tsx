'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useInviteStore } from '@/store';
import RoomCanvas from '@/components/RoomCanvas';
import Invite from '@/components/Invite';
import PlayerName from '@/components/PlayerName';

const InviteRoom = () => {
    const params = useParams();
    const roomID = params!.roomID;

    const { playerName, roomType, setPreference, invite, setInvite } = useInviteStore();

    useEffect(() => {
        if (roomID) {
            setPreference("Share");
        }

        if (roomType === "Create") {
            toast.success("Room created!");
            setInvite(true);
        }
        else if (roomType === "Join") {
            toast.success("Room joined!");
            setInvite(false);
        }
    }, []);
    // }, [roomID, roomType, setPreference, setInvite]);

    return (
        !playerName ? <PlayerName /> : (
            <div className='overflow-y-hidden relative w-screen flex flex-col items-center justify-between'>
                {roomID && <RoomCanvas />}
                {invite && <Invite />}
            </div>
        )
    )
};

export default React.memo(InviteRoom);
