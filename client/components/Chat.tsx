import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useSidebarStore } from '@/store';

interface ChatProps {
    socketRef: React.MutableRefObject<Socket | null>;
    messages: { playerName: string, message: string }[];
}

const Chat: React.FC<ChatProps> = ({ socketRef, messages }) => {
    const { assignedPlayerName } = useSidebarStore();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (newMessage.trim()) {
            const socket = socketRef.current;
            socket?.emit('send-chat-message', { playerName: assignedPlayerName, message: newMessage });
            setNewMessage('');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className='h-full relative'>
            <div className='h-[calc(100%-64px)] p-2 md:p-5 flex flex-col gap-2 md:gap-5 overflow-auto'>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.playerName === assignedPlayerName ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className='bg-gray-200 text-black p-2 rounded'>
                            <strong>{msg.playerName === assignedPlayerName ? 'Me' : msg.playerName.split('#')[0]}:</strong> {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className='absolute left-0 bottom-0 p-2 md:p-5 w-full flex items-center gap-2 border-t border-gray-400' onSubmit={handleSendMessage}>
                <input
                    type='text'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder='Say hello...'
                    className='px-2 flex-1 h-[40px] border border-gray-400 outline-none rounded'
                />
                <button className='py-2 px-4 bg-black text-white active:scale-90 duration-200 rounded'>
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;