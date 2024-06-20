'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { useInviteStore } from '@/store';
import useWindowSize from '@/utils/useWindowSize';
import RoomCanvas from '@/components/RoomCanvas';
import Invite from '@/components/Invite';

const InviteRoom = () => {
    const params = useParams();
    const roomID = params!.roomID;

    const { roomType, setRoomID, setPreference, invite, setInvite } = useInviteStore();
    const { width, height } = useWindowSize();

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
        <>
            <Toaster
                position='top-center'
                duration={5000}
                richColors
            />
            <div className='overflow-y-hidden relative w-screen flex flex-col items-center justify-between bg-black'>
                <RoomCanvas width={width} height={height} />
                {invite && <Invite />}
            </div>
        </>
    )
};

export default InviteRoom