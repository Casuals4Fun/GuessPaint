"use client"

import { Toaster } from 'sonner';
import Invite from '@/components/Invite';

const Room = () => {
    return (
        <>
            <Toaster
                position='top-center'
                duration={5000}
                richColors
            />
            <div className='overflow-y-hidden relative w-screen h-[100dvh] flex flex-col items-center justify-between bg-black' />
            <Invite />
        </>
    )
}

export default Room