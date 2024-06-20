"use client"

import React, { useEffect } from 'react';
import { useInviteStore, useSocketStore, useToolbarStore } from '@/store';
import { HexColorPicker } from 'react-colorful';
import { AiOutlineClose, AiOutlineCloudDownload } from 'react-icons/ai';
import { PiEraserFill, PiPaintBrushFill, PiPencil, PiShareNetworkFill } from 'react-icons/pi';
import { GrPaint } from 'react-icons/gr';
import { connectSocket } from '@/utils/connectSocket';

interface ToolbarProps {
    clear: () => void
};

const RoomToolbar = ({ clear }: ToolbarProps) => {
    const { setConnected } = useSocketStore();
    const socket = connectSocket(setConnected);

    const { setInvite } = useInviteStore();
    const {
        bgSelect, setBgSelect,
        canvasBg, setCanvasBg,
        colorPicker, setColorPicker,
        color, setColor,
        brushEdit, setBrushEdit,
        brushThickness, setBrushThickness,
        downloadSelect, setDownloadSelect
    } = useToolbarStore();

    const handleCanvasBg = (e: string) => {
        setCanvasBg(e);
    };

    return (
        <div className='absolute top-0 left-0 right-0 flex justify-between p-2 bg-gray-300 border-t border-x border-gray-400'>
            <div className="flex gap-2">
                <div className='relative'>
                    <button
                        title='Color Picker'
                        onClick={() => {
                            setColorPicker(!colorPicker);
                            setBgSelect(false);
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
                <div className='relative'>
                    <button
                        title='Background'
                        onClick={() => {
                            setBgSelect(!bgSelect);
                            setColorPicker(false);
                            setBrushEdit(false);
                        }}
                        className={`bg-white active:scale-[0.8] duration-200 rounded-full p-2`}
                    >
                        {bgSelect ? <AiOutlineClose size={22} /> : <GrPaint size={22} />}
                    </button>
                    {bgSelect && (
                        <HexColorPicker
                            color={canvasBg}
                            onChange={handleCanvasBg}
                            className='!absolute top-10 left-0'
                        />
                    )}
                </div>
                {/* <div className='relative'>
                    <button
                        title='Brush Thickness'
                        onClick={() => {
                            setBrushEdit(!brushEdit);
                            setColorPicker(false);
                            setBgSelect(false);
                        }}
                        className='bg-white active:scale-[0.8] duration-200 rounded-full p-2'
                    >
                        {brushEdit ? <AiOutlineClose size={22} /> : <PiPencil size={22} />}
                    </button>
                    {brushEdit && (
                        <div className="w-[179px] absolute top-10 left-0 bg-white pt-2 px-2 border rounded flex flex-col gap-5">
                            <div className="flex gap-2">
                                <div className="flex items-center justify-center gap-1">
                                    <input
                                        type='range'
                                        min={1}
                                        max={10}
                                        value={brushThickness}
                                        onChange={e => setBrushThickness(e.target.valueAsNumber)}
                                        className="w-full"
                                    />
                                </div>
                                <div className={`w-[20px] h-[20px] flex items-center justify-center`}>
                                    {brushThickness}
                                </div>
                            </div>
                            <div className="text-gray-400 text-[10px]">
                                *BETA
                            </div>
                        </div>
                    )}
                </div> */}
                <button
                    title='Erase All'
                    onClick={() => {
                        clear();
                        setColorPicker(false);
                        setBgSelect(false);
                        setBrushEdit(false);
                    }}
                    className='bg-white active:scale-[0.8] duration-200 rounded-full p-2'
                >
                    <PiEraserFill size={22} />
                </button>
            </div>
            <div className="flex gap-2">
                <button
                    // className='px-4 text-black bg-white hover:bg-black hover:text-white duration-200 rounded-3xl flex gap-1 items-center justify-center'
                    className='bg-white active:scale-[0.8] duration-200 rounded-full p-2'
                    onClick={() => setInvite(true)}
                >
                    <PiShareNetworkFill size={22} />
                    {/* <p>Invite</p> */}
                </button>
                {/* <button
                    title='Save Drawing'
                    onClick={() => setDownloadSelect(!downloadSelect)}
                    className='bg-white hover:scale-[0.8] duration-200 rounded-full p-2'
                >
                    <AiOutlineCloudDownload size={22} />
                </button> */}
            </div>
        </div>
    )
}

export default RoomToolbar