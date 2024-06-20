"use client"

import { useInviteStore } from '@/store';
import PlayerName from '@/components/PlayerName';
import Invite from '@/components/Invite';

const Home = () => {
  const { playerName } = useInviteStore();

  return !playerName ? <PlayerName /> : <Invite />
};

export default Home