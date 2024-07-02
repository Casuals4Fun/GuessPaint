import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { PlayerName } from '../components/Input'
import Invite from '../components/Invite'
import { useSidebarStore } from '../store'

const Home = () => {
    const { assignedPlayerName } = useSidebarStore();

    return (
        <div className='h-[100dvh] grid place-content-center overflow-auto'>
            {!assignedPlayerName.split('#')[0].trim() ? <PlayerName /> : <Invite />}
            <DotLottieReact src="/Pencil.lottie" loop autoplay speed={0.5} className='w-full h-[300px] sm:h-full' />
        </div>
    )
}

export default Home