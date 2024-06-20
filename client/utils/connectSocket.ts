import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const connectSocket = (setConnected: Dispatch<SetStateAction<boolean>>) => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
        extraHeaders: {
            "user-agent": "Mozilla"
        }
    });

    const socketRef = useRef<Socket>();
    useEffect(() => {
        socketRef.current = socket;
        socketRef.current.on('connect', () => {
            setConnected(true);
        });
        socketRef.current.on('disconnect', () => {
            setConnected(false);
        });
        return () => {
            if (socketRef.current) {
                socketRef.current.off('connect');
                socketRef.current.off('disconnect');
            }
        };
    }, []);

    return socket;
}