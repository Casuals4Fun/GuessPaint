"use client"

import React from 'react';
import { useInviteStore, useToolbarStore } from '@/store';
import { HexColorPicker } from 'react-colorful';
import { AiOutlineClose } from 'react-icons/ai';
import { PiEraserFill, PiPaintBrushFill, PiShareNetworkFill } from 'react-icons/pi';
import { RxExit } from "react-icons/rx";
import Link from 'next/link';

interface ToolbarProps {
    canDraw: boolean
    clear: () => void
    exit: () => void
};

const RoomToolbar = ({ canDraw, clear, exit }: ToolbarProps) => {
    const { setInvite } = useInviteStore();
    const {
        colorPicker, setColorPicker,
        color, setColor,
        brushEdit, setBrushEdit
    } = useToolbarStore();

    return (
        <div className='absolute z-[1] top-0 left-0 md:left-auto md:w-[400px] lg:w-[450px] right-0 flex items-center justify-between p-2 bg-gray-300 md:border-l border-gray-400'>
            <div className="flex gap-2">
                {canDraw && (
                    <>
                        <div className='relative'>
                            <button
                                title='Color Picker'
                                onClick={() => {
                                    setColorPicker(!colorPicker);
                                    setBrushEdit(false);
                                }}
                                className='bg-white active:scale-[0.8] duration-200 rounded-full p-2'
                            >
                                {colorPicker ? <AiOutlineClose size={22} /> : <PiPaintBrushFill color={color} size={22} />}
                            </button>
                            {colorPicker && (
                                <HexColorPicker
                                    color={color}
                                    onChange={setColor}
                                    className='!absolute top-10 left-0'
                                />
                            )}
                        </div>
                        <button
                            title='Erase All'
                            onClick={() => {
                                clear();
                                setColorPicker(false);
                                setBrushEdit(false);
                            }}
                            className='bg-white active:scale-[0.8] duration-200 rounded-full p-2'
                        >
                            <PiEraserFill size={22} />
                        </button>
                    </>
                )}
            </div>

            <div className="flex gap-2">
                <div className="flex gap-2">
                    <button
                        className='bg-white active:scale-[0.8] duration-200 rounded-full p-2'
                        onClick={() => setInvite(true)}
                    >
                        <PiShareNetworkFill size={22} />
                    </button>
                    <Link href='/' onClick={exit} className='size-[38px] grid place-items-center bg-white active:scale-[0.8] duration-200 rounded-full'>
                        <RxExit size={20} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default RoomToolbar