"use client"

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation'
import { useInviteStore } from '@/store';
import { useRoom } from '@/hooks/useRoom';
import { IoIosArrowBack } from 'react-icons/io';
import { AiOutlineClose } from 'react-icons/ai';
import { GrAdd } from 'react-icons/gr';
import { GoPeople } from 'react-icons/go';
import { BsFillClipboardCheckFill, BsFillClipboardFill } from 'react-icons/bs';
import { toast } from 'sonner';
import { BarLoader } from 'react-spinners';

const Invite = () => {
    const params = useParams();
    const roomID = params.roomID;
    const { invite, setInvite, preference, setPreference } = useInviteStore();

    return (
        <div className="fixed inset-0 flex items-center justify-center z-30">
            <div className="bg-black opacity-70 fixed inset-0 z-20"></div>
            <div className={`bg-white w-[95%] md:w-[500px] ${preference === "Join" ? "h-[500px]" : preference !== "Share" ? "h-[214px]" : "min-h-[214px]"} mx-auto rounded-lg shadow-lg overflow-hidden z-30 relative`}>
                {(preference !== "Share" && preference !== "") && (
                    <button
                        className='absolute left-0 top-0 w-[30px] h-[30px] bg-gray-100 hover:bg-black text-black hover:text-white duration-200 flex items-center justify-center'
                        onClick={() => {
                            if (roomID) return setPreference("Share");
                            setPreference("");
                        }}
                    >
                        <IoIosArrowBack />
                    </button>
                )}
                {location.pathname !== "/" && location.pathname !== "/room" && (
                    <button
                        className='absolute right-0 top-0 w-[30px] h-[30px] bg-gray-100 hover:bg-black text-black hover:text-white duration-200 flex items-center justify-center'
                        onClick={() => setInvite(!invite)}
                    >
                        <AiOutlineClose />
                    </button>
                )}
                <div className="p-5 h-full">
                    {preference === "" ? (
                        <PreferenceSelector />
                    ) : preference === "Join" ? (
                        <JoinRoom />
                    ) : preference === "Share" ? (
                        <ShareRoom />
                    ) : null}
                </div>
            </div>
        </div>
    )
};

const PreferenceSelector = () => {
    const { handleCreateRoom, isCreating } = useRoom();
    const { setPreference } = useInviteStore();

    return (
        <div className='h-full flex flex-col justify-between'>
            <div className='h-full flex items-center justify-center gap-20'>
                {isCreating ? <div className='w-[96px] flex items-center justify-center'><BarLoader height={4} width={50} /></div> : (
                    <button className='flex flex-col items-center gap-1' onClick={handleCreateRoom} disabled={isCreating}>
                        <div className='w-[95px] h-[95px] bg-gray-100 rounded-full hover:border cursor-pointer flex items-center justify-center'>
                            <GrAdd size={30} />
                        </div>
                        <div className='cursor-pointer'>
                            Create Room
                        </div>
                    </button>
                )}
                <div className='flex flex-col items-center gap-1'>
                    <div
                        className='w-[95px] h-[95px] bg-gray-100 rounded-full hover:border cursor-pointer flex items-center justify-center'
                        onClick={() => setPreference("Join")}
                    >
                        <GoPeople size={30} />
                    </div>
                    <div className='cursor-pointer' onClick={() => setPreference("Join")}>
                        Join Room
                    </div>
                </div>
            </div>
        </div>
    )
};

const JoinRoom = () => {
    const { setInvite } = useInviteStore();
    const { handleJoinRoom, isJoining } = useRoom();
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [rooms, setRooms] = useState([]);

    const [roomID, setRoomID] = useState(Array(5).fill(''));
    const inputRefs = useRef([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z0-9]$/.test(value) || value === '') {
            const newRoomID = [...roomID];
            newRoomID[index] = value;
            setRoomID(newRoomID);

            if (value !== '' && index < 4) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && roomID[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    useEffect(() => {
        const getAllRooms = async () => {
            setIsLoadingRooms(true);

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/list-rooms`, { method: 'GET' });
                const rooms = await response.json();
                setRooms(rooms);
            } catch (error) {
                console.error('Error fetching rooms:', error);
                toast.error('Failed to fetch rooms');
            } finally {
                setIsLoadingRooms(false);
            }
        };
        getAllRooms();
    }, []);

    return (
        <div className='h-full flex flex-col overflow-hidden'>
            <p className='text-[20px] text-center mb-3'>
                Join Room
            </p>
            <div className='flex items-center justify-between'>
                <p>Room ID</p>
                <div className='flex justify-end space-x-2'>
                    {roomID.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            className='w-10 h-10 border border-gray-300 rounded text-center outline-none'
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            maxLength={1}
                        />
                    ))}
                </div>
            </div>
            <div className='flex justify-end items-center mt-3'>
                <button
                    className={`${isJoining ? "bg-white" : "bg-black hover:bg-white text-white hover:text-black duration-200"} w-[80px] h-[40px] py-2 px-4 rounded-lg`}
                    onClick={() => handleJoinRoom(roomID.join('').toUpperCase().trim())}
                >
                    {isJoining ? (
                        <BarLoader
                            height={4}
                            width={50}
                        />
                    ) : "Join"}
                </button>
            </div>
            <div className='w-full h-[1px] bg-gray-200 my-3' />
            <div className='flex-1 flex flex-col overflow-y-auto'>
                <p className='text-[20px] text-center mb-3'>
                    Available Rooms
                </p>
                {isLoadingRooms ? "Fetching rooms" : rooms.length == 0 ? "No rooms" : (
                    <ul className='flex-1 flex flex-col gap-2'>
                        {rooms.map((item, i) => (
                            <li key={i} className='p-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer'>
                                <Link href={`/room/${item.roomID}`} className='flex justify-between' onClick={() => setInvite(false)}>
                                    <p>{item.roomID}</p>
                                    <p>{item.playerCount ? (
                                        <>{item.playerCount} {item.playerCount > 0 ? "players" : "player"}</>
                                    ) : "No players"}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div >
    )
};

const ShareRoom = () => {
    const params = useParams();
    const roomID = params.roomID as string;
    const { handleCreateRoom, isCreating } = useRoom();
    const { setPreference } = useInviteStore();

    const [hasCopied, setHasCopied] = useState<boolean>(false);
    const copyToClipboard = async () => {
        const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/room/${roomID}`;
        if (!hasCopied) {
            try {
                await navigator.clipboard.writeText(url);
                setHasCopied(true);
                toast.success("Copied!");
            } catch (err) {
                console.error('Failed to copy URL: ', err);
            }
        } else {
            toast("Already Copied!");
        }
    };

    return (
        <div className='h-full flex flex-col gap-5 justify-between'>
            {roomID ? (
                <>
                    <p className='text-[20px] text-center'>
                        Share Invite
                    </p>
                    <div className='relative mx-auto w-[125px] h-[125px] md:w-[150px] md:h-[150px] flex items-center justify-center'>
                        <Image
                            width={150}
                            height={150}
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${process.env.NEXT_PUBLIC_FRONTEND_URL}/room/${roomID}`}
                            className='absolute z-[1] top-0 left-0 object-contain border-2'
                            alt="Share QR"
                        />
                        <BarLoader
                            height={4}
                            width={50}
                            className='absolute z-0'
                        />
                    </div>
                    <div className="flex space-x-2 mx-auto">
                        {roomID.split('').map((digit, index) => (
                            <div key={index} className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded font-semibold">
                                {digit}
                            </div>
                        ))}
                    </div>
                    <div className='w-full min-h-[42px] flex border border-gray-300 rounded-md pl-2 overflow-hidden'>
                        <div className='w-[90%] min-h-full text-ellipsis overflow-hidden border-r border-gray-300 py-2'>
                            {`${process.env.NEXT_PUBLIC_FRONTEND_URL}/room/${roomID}`}
                        </div>
                        <button
                            title={`${hasCopied ? "Copied" : "Copy URL"}`}
                            className={`w-[10%] min-h-full flex items-center justify-center py-2 cursor-pointer ${hasCopied ? "bg-gray-200 text-black" : "bg-black text-white"} duration-200`}
                            onClick={copyToClipboard}
                        >
                            {hasCopied ? <BsFillClipboardCheckFill size={20} /> : <BsFillClipboardFill size={20} />}
                        </button>
                    </div>
                    <div className='w-full h-[1px] bg-gray-200' />
                    <div className='flex justify-between items-center'>
                        <button className='hover:underline text-[14px]' onClick={handleCreateRoom} disabled={isCreating}>
                            Create new Room
                        </button>
                        <button className='hover:underline text-[14px]' onClick={() => setPreference("Join")}>
                            Join new Room
                        </button>
                    </div>
                </>
            ) : <PreferenceSelector />}
        </div>
    )
};

export default Invite