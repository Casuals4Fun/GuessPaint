"use client"

import usePlayerName from '@/hooks/usePlayerName';
import PlayerName from '@/components/PlayerName';
import Invite from '@/components/Invite';

const Home = () => {
  const { playerName, savePlayerName, loading } = usePlayerName();

  if (loading) return null;
  return !playerName ? <PlayerName onSavePlayerName={savePlayerName} /> : <Invite />;
};

export default Home