"use client"

import DrawCanvas from '@/components/DrawCanvas';
import Invite from '@/components/Invite';
import { useInviteStore } from '@/store';
import useWindowSize from '@/utils/useWindowSize';
import { Toaster } from 'sonner';

const Home = () => {
  const { width, height } = useWindowSize();
  const { invite } = useInviteStore();

  return (
    <>
      <Toaster
        position='top-center'
        duration={5000}
        richColors
      />
      <div className='overflow-y-hidden relative w-screen flex flex-col items-center justify-between bg-black'>
        <DrawCanvas width={width} height={height} />
        {invite && <Invite />}
      </div>
    </>
  )
};

export default Home