import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import usePlayerName from '../hooks/usePlayerName'
import { useInviteStore } from '../store'
import { PlayerName } from '../components/Input'
import Canvas from '../components/Canvas'
import Invite from '../components/Invite'

const Room = () => {
    const roomID = useParams().roomID as string;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return null;
    return !playerName ? <PlayerName onSavePlayerName={savePlayerName} /> : (
        <div className='overflow-y-hidden relative w-screen flex flex-col items-center justify-between'>
            {roomID && <Canvas />}
            {invite && <Invite />}
        </div>
    )
};

export default Room