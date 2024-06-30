import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useInviteStore } from '@/store'
import { useRoom } from '@/hooks/useRoom'
import { toast } from 'sonner'
import { BarLoader } from 'react-spinners'
import { IoIosArrowBack } from 'react-icons/io'
import { AiOutlineClose } from 'react-icons/ai'
import { FaPlay } from "react-icons/fa"
import { GrAdd } from 'react-icons/gr'
import { GoPeople } from 'react-icons/go'
import { BsFillClipboardCheckFill, BsFillClipboardFill } from 'react-icons/bs'

const Invite = () => {
    const roomID = useParams().roomID as string;

    const { invite, setInvite, preference, setPreference } = useInviteStore();

    return (
        <div className="fixed inset-0 flex items-center justify-center z-30">
            <div className="bg-black opacity-70 fixed inset-0 z-20"></div>
            <div className='bg-white w-[95%] md:w-[500px] grid place-items-center mx-auto rounded-lg shadow-lg overflow-hidden z-30 relative'>
                {preference === "" ? (
                    <PreferenceSelector />
                ) : preference === "Join" ? (
                    <JoinRoom />
                ) : preference === "Share" ? (
                    <ShareRoom />
                ) : null}
                <div className='w-full h-[1px] bg-gray-200' />
                <p className='text-center text-sm p-3'>Made with ❤️ by <a href="https://github.com/Shubham-Lal" target="_blank" rel="noopener noreferrer" className='underline'>Shubham Lal</a></p>

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
            </div>
        </div>
    )
};

const PreferenceSelector = () => {
    const { isPlaying, handleRandomRoom, handleCreateRoom, isCreating } = useRoom();
    const { setPreference } = useInviteStore();

    return (
        <div className='p-5 w-full flex flex-col gap-4 justify-between'>
            <button
                className={`bg-gray-100 sm:max-w-[175px] w-full h-[56px] mx-auto flex items-center justify-center gap-2 rounded-md ${isPlaying || isCreating ? 'cursor-not-allowed' : 'hover:border'}`}
                disabled={isPlaying || isCreating}
                onClick={handleRandomRoom}
            >
                {isPlaying ? <BarLoader height={4} width={50} /> : (
                    <>
                        <p>Play</p>
                        <FaPlay size={15} />
                    </>
                )}
            </button>
            <div className='h-full flex items-center justify-center gap-4 flex-wrap'>
                <button
                    className={`bg-gray-100 sm:max-w-[175px] w-full h-[56px] mx-auto flex items-center justify-center gap-2 rounded-md ${isPlaying || isCreating ? 'cursor-not-allowed' : 'hover:border'}`}
                    disabled={isPlaying || isCreating}
                    onClick={handleCreateRoom}
                >
                    {isCreating ? <BarLoader height={4} width={50} /> : (
                        <>
                            <p>Create Room</p>
                            <GrAdd size={15} />
                        </>
                    )}
                </button>
                <button
                    className={`bg-gray-100 sm:max-w-[175px] w-full h-[56px] mx-auto flex items-center justify-center gap-2 rounded-md ${isPlaying || isCreating ? 'cursor-not-allowed' : 'hover:border'}`}
                    disabled={isPlaying || isCreating}
                    onClick={() => setPreference("Join")}
                >
                    <p>Join Room</p>
                    <GoPeople size={15} />
                </button>
            </div>
        </div>
    )
};

const JoinRoom = () => {
    type Room = {
        roomID: string;
        playerCount: number;
        isLoading: boolean;
    };

    const router = useRouter();
    const { setInvite } = useInviteStore();
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isInputJoining, setIsInputJoining] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomID, setRoomID] = useState(Array(5).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z0-9]$/.test(value) || value === '') {
            const newRoomID = [...roomID];
            newRoomID[index] = value;
            setRoomID(newRoomID);

            if (value !== '' && index < 4) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && roomID[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        const getAllRooms = async () => {
            setIsLoadingRooms(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/list-rooms`, { method: 'GET' });
                const roomsData = await response.json();
                const roomsWithLoading: Room[] = roomsData.map((room: { roomID: string, playerCount: number }) => ({
                    ...room,
                    isLoading: false,
                }));
                setRooms(roomsWithLoading);
            } catch (error) {
                console.error('Error fetching rooms:', error);
                toast.error('Failed to fetch rooms');
            } finally {
                setIsLoadingRooms(false);
            }
        };
        getAllRooms();
    }, []);

    const handleJoinRoom = async (roomID: string, isInputJoin: boolean, roomIndex?: number) => {
        if (!roomID.length) return toast.warning("Enter Room ID to proceed");

        if (isInputJoin) {
            setIsInputJoining(true);
        } else if (roomIndex !== undefined) {
            const newRooms = [...rooms];
            newRooms[roomIndex].isLoading = true;
            setRooms(newRooms);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/join-room?roomID=${roomID}`, { method: 'GET' });
            const data = await response.json();

            if (data.success) {
                setInvite(false);
                router.push(`/${roomID}`, { shallow: true } as any);
            } else {
                toast.error('No room found');
                if (isInputJoin) {
                    setIsInputJoining(false);
                } else if (roomIndex !== undefined) {
                    const newRooms = [...rooms];
                    newRooms[roomIndex].isLoading = false;
                    setRooms(newRooms);
                }
            }
        } catch (error) {
            console.error('Error joining room:', error);
            toast.error('Failed to join room');
            if (isInputJoin) {
                setIsInputJoining(false);
            } else if (roomIndex !== undefined) {
                const newRooms = [...rooms];
                newRooms[roomIndex].isLoading = false;
                setRooms(newRooms);
            }
        }
    };

    return (
        <div className='p-5 w-full h-[400px] flex flex-col overflow-hidden'>
            <p className='text-[20px] text-center mb-3'>
                Join Room
            </p>
            <div className='flex items-center justify-between'>
                <p>Room ID</p>
                <div className='flex justify-end space-x-2'>
                    {roomID.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
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
                    className={`${isInputJoining ? "bg-white cursor-not-allowed" : "bg-black text-white active:scale-90 duration-200"} w-[80px] h-[40px] py-2 px-4 rounded`}
                    onClick={() => handleJoinRoom(roomID.join(''), true)}
                >
                    {isInputJoining ? <BarLoader height={4} width={50} /> : "Join"}
                </button>
            </div>
            <div className='w-full h-[1px] bg-gray-200 my-3' />
            <div className='flex-1 flex flex-col overflow-y-auto'>
                <p className='text-[20px] text-center mb-3'>
                    Available Rooms
                </p>
                {isLoadingRooms ? <BarLoader height={4} width={50} className='mx-auto' /> : rooms.length === 0 ? "No rooms" : (
                    <ul className='flex-1 flex flex-col gap-2'>
                        {rooms.map((item, i) => (
                            <li key={i} className={`p-2 min-h-10 bg-gray-100 flex items-center justify-center rounded-md ${item.isLoading || isInputJoining ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-200'}`}>
                                {item.isLoading ? <BarLoader height={4} width={50} /> : (
                                    <button
                                        className='w-full flex items-center justify-between'
                                        disabled={item.isLoading || isInputJoining}
                                        onClick={() => handleJoinRoom(item.roomID, false, i)}
                                    >
                                        <p>{item.roomID}</p>
                                        <p>{item.playerCount === 0 ? "No players" : <>{item.playerCount} {item.playerCount === 1 ? "player" : "players"}</>}</p>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div >
    )
};

const ShareRoom = () => {
    const roomID = useParams().roomID as string;

    const [hasCopied, setHasCopied] = useState<boolean>(false);
    const copyToClipboard = async () => {
        const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/room/${roomID}`;
        if (!hasCopied) {
            try {
                await navigator.clipboard.writeText(url);
                setHasCopied(true);
                toast.success("Copied");
            } catch (err) {
                console.error('Failed to copy URL: ', err);
            }
        } else {
            toast("Already Copied!");
        }
    };

    return (
        <div className='p-5 w-full flex flex-col gap-5 justify-between'>
            {roomID ? (
                <>
                    <p className='text-[20px] text-center'>
                        Share Invite
                    </p>
                    <div className='relative mx-auto w-[125px] h-[125px] md:w-[150px] md:h-[150px] flex items-center justify-center border-2'>
                        <Image
                            width={150}
                            height={150}
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${process.env.NEXT_PUBLIC_FRONTEND_URL}/${roomID}`}
                            className='absolute z-[1] top-0 left-0 object-contain'
                            alt="Share QR"
                        />
                        <BarLoader
                            height={4}
                            width={50}
                            className='absolute z-0'
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 mx-auto">
                        {roomID.split('').map((digit, index) => (
                            <div key={index} className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded font-semibold">
                                {digit}
                            </div>
                        ))}
                    </div>
                    <div className='w-full min-h-[42px] flex border border-gray-300 rounded-md pl-2 overflow-hidden'>
                        <div className='w-[90%] min-h-full text-ellipsis overflow-hidden border-r border-gray-300 py-2'>
                            {`${process.env.NEXT_PUBLIC_FRONTEND_URL?.split(/https?:\/\//)[1]}/${roomID}`}
                        </div>
                        <button
                            title={`${hasCopied ? "Copied" : "Copy URL"}`}
                            className={`w-[10%] min-h-full flex items-center justify-center py-2 cursor-pointer ${hasCopied ? "bg-gray-200 text-black" : "bg-black text-white"} duration-200`}
                            onClick={copyToClipboard}
                        >
                            {hasCopied ? <BsFillClipboardCheckFill size={20} /> : <BsFillClipboardFill size={20} />}
                        </button>
                    </div>
                </>
            ) : <PreferenceSelector />}
        </div>
    )
};

export default Invite