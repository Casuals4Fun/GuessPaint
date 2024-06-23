'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import usePlayerName from '@/hooks/usePlayerName';
import { useInviteStore } from '@/store';
import RoomCanvas from '@/components/RoomCanvas';
import Invite from '@/components/Invite';
import PlayerName from '@/components/PlayerName';

const InviteRoom = () => {
    const params = useParams();
    const roomID = params.roomID as string;

    const { playerName, savePlayerName, loading } = usePlayerName();
    const { roomType, setPreference, invite, setInvite } = useInviteStore();

    useEffect(() => {
        setPreference("Share");

        if (roomType === "Create") {
            toast.success("Room created");
            setInvite(true);
        }
        else {
            toast.success("Room joined");
            setInvite(false);
        }
    }, []);

    if (loading) return null;
    return !playerName ? <PlayerName onSavePlayerName={savePlayerName} /> : (
        <div className='overflow-y-hidden relative w-screen flex flex-col items-center justify-between'>
            {roomID && <RoomCanvas />}
            {invite && <Invite />}
        </div>
    )
};

export default React.memo(InviteRoom);
