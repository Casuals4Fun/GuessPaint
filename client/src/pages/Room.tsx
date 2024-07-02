import { useEffect } from 'react'
import { toast } from 'sonner'
import { useInviteStore, useSidebarStore } from '../store'
import { PlayerName } from '../components/Input'
import Canvas from '../components/Canvas'
import Invite from '../components/Invite'

const Room = () => {
    const { roomType, setPreference, invite, setInvite } = useInviteStore();
    const { assignedPlayerName } = useSidebarStore();

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

    return !assignedPlayerName.split('#')[0].trim() ? <PlayerName /> : (
        <>
            <Canvas />
            {invite && <Invite />}
        </>
    )
};

export default Room