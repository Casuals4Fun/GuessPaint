import { Dispatch, SetStateAction } from "react";
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const connectSocket = (setConnected: Dispatch<SetStateAction<boolean>>) => {
    if (!socketInstance) {
        socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
            extraHeaders: {
                "user-agent": "Mozilla"
            }
        });

        socketInstance.on('connect', () => {
            setConnected(true);
        });
        socketInstance.on('disconnect', () => {
            setConnected(false);
        });
    }

    return socketInstance;
};