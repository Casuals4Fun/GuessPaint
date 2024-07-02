// import { DotLottieReact } from '@lottiefiles/dotlottie-react'
// import usePlayerName from '../hooks/usePlayerName'
import { PlayerName } from '../components/Input'
import Invite from '../components/Invite'
import { useSidebarStore } from '../store'

const Home = () => {
    // const { loading, playerName, savePlayerName } = usePlayerName();
    const { assignedPlayerName } = useSidebarStore();

    // if (loading) return null;
    return (
        <div className='h-[100dvh] flex items-end justify-center'>
            {/* {!playerName ? <PlayerName onSavePlayerName={savePlayerName} /> : <Invite />} */}
            {!assignedPlayerName ? <PlayerName /> : <Invite />}

            {/* <DotLottieReact src="/Pencil.lottie" loop autoplay speed={0.5} className='w-full h-[300px] sm:h-full' /> */}
        </div>
    )
}

export default Home