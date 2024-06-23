"use client"

import usePlayerName from '@/hooks/usePlayerName';
import PlayerName from '@/components/PlayerName';
import Invite from '@/components/Invite';

const Home = () => {
  const { loading, playerName, savePlayerName } = usePlayerName();

  if (loading) return null;
  return !playerName ? <PlayerName onSavePlayerName={savePlayerName} /> : <Invite />;
};

export default Home