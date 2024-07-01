import { io, Socket } from 'socket.io-client'

let socketInstance: Socket | null = null;

export const connectSocket = () => {
    if (!socketInstance) {
        socketInstance = io(import.meta.env.VITE_BACKEND_URL!, {
            extraHeaders: {
                "user-agent": "Mozilla"
            }
        });

        socketInstance.on('connect', () => {
            console.log('Connected to socket server');
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
    }

    return socketInstance;
};