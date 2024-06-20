"use client"

import { useInviteStore } from '@/store';
import PlayerName from '@/components/PlayerName';
import Invite from '@/components/Invite';

const Room = () => {
    const { playerName } = useInviteStore();

    return !playerName ? <PlayerName /> : <Invite />
}

export default Room