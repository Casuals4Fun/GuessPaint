import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import usePlayerName from '../hooks/usePlayerName'
import { PlayerName } from '../components/Input'
import Invite from '../components/Invite'

const Home = () => {
    const { loading, playerName, savePlayerName } = usePlayerName();

    if (loading) return null;
    return (
        <div className='h-[100dvh] flex items-end justify-center'>
            {!playerName ? <PlayerName onSavePlayerName={savePlayerName} /> : <Invite />}

            <DotLottieReact src="/Pencil.lottie" loop autoplay speed={0.5} className='w-full h-[300px] sm:h-full' />
        </div>
    )
}

export default Home