import React from 'react'
import { Socket } from 'socket.io-client'

interface ChatProps {
    socketRef: React.MutableRefObject<Socket | null>;
}

const Chat: React.FC<ChatProps> = ({ socketRef }) => {
    return (
        <div>
            Chat Section
        </div>
    )
}

export default Chat