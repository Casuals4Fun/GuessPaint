import { Toaster } from 'sonner'
import useWindowSize from '../utils/useWindowSize'

const Toast = () => {
    const { width } = useWindowSize();

    return (
        <Toaster
            position={width < 768 ? 'bottom-center' : 'top-center'}
            duration={5000}
            richColors
        />
    );
};

export default Toast;