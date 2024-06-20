"use client"

import React, { RefObject } from 'react';
import { useToolbarStore } from '@/store';
import { downloadDrawing } from '@/utils/downloadDrawing';
import { HexColorPicker } from 'react-colorful';

interface SaveImageProps {
    canvasRef: RefObject<HTMLCanvasElement>;
}

const SaveImage: React.FC<SaveImageProps> = ({ canvasRef }) => {
    const {
        canvasBg,
        downloadSelect, setDownloadSelect,
        downloadCanvasWidth, setDownloadCanvasWidth,
        downloadCanvasHeight, setDownloadCanvasHeight,
        openCanvasBg, setOpenCanvasBg,
        downloadCanvasBg, setDownloadCanvasBg
    } = useToolbarStore();

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-70 fixed inset-0 z-40"></div>
            <div className="bg-white w-[95%] md:w-[500px] mx-auto rounded-lg shadow-lg overflow-hidden z-50">
                <div className='w-full flex items-center justify-between pt-4 px-4 pb-2'>
                    <p className='text-[20px] font-semibold'>Customize</p>
                </div>
                <div>
                    <div className='flex items-center px-4 pb-2 pt-4'>
                        <div className='w-1/2'>
                            Dimensions
                        </div>
                        <div className='w-1/2 flex gap-3'>
                            <div className='w-1/2 flex items-center gap-1'>
                                <input
                                    className='w-full outline-none border rounded-md py-2 px-1 md:px-4 text-center'
                                    value={downloadCanvasWidth}
                                    onChange={e => setDownloadCanvasWidth(e.target.value)}
                                    placeholder='Width'
                                />
                                <span>px</span>
                            </div>
                            <div className='w-1/2 flex items-center gap-1'>
                                <input
                                    className='w-full outline-none border rounded-md py-2 px-1 md:px-4 text-center'
                                    value={downloadCanvasHeight}
                                    onChange={e => setDownloadCanvasHeight(e.target.value)}
                                    placeholder='Height'
                                />
                                <span>px</span>
                            </div>
                        </div>
                    </div>
                    <div className='px-4 pt-2 pb-4'>
                        <div className='flex items-center justify-between '>
                            <div>
                                Background
                            </div>
                            <div className='flex items-center gap-2'>
                                <div
                                    onClick={() => setOpenCanvasBg(!openCanvasBg)}
                                    className='w-[30px] h-[30px] border rounded cursor-pointer'
                                    style={{ background: downloadCanvasBg === '#fff' ? canvasBg : downloadCanvasBg }}
                                />
                                <div
                                    onClick={() => setOpenCanvasBg(!openCanvasBg)}
                                    className='uppercase cursor-pointer'
                                >
                                    {downloadCanvasBg === '#fff' ? canvasBg : downloadCanvasBg}
                                </div>
                            </div>
                        </div>
                        {openCanvasBg && (
                            <div className='flex justify-end pt-2'>
                                <HexColorPicker
                                    color={downloadCanvasBg}
                                    onChange={setDownloadCanvasBg}
                                />
                            </div>
                        )}
                    </div>
                    <div className='w-full border-t'>
                        <div className='flex justify-between m-4'>
                            <button
                                onClick={() => setDownloadSelect(!downloadSelect)}
                                className='bg-gray-200 hover:bg-black text-black hover:text-white duration-200 py-2 px-4 rounded-lg'
                            >
                                Close
                            </button>
                            <button
                                onClick={() => downloadDrawing(canvasRef, downloadCanvasBg, canvasBg, downloadCanvasWidth, downloadCanvasHeight)}
                                className=' bg-black hover:bg-white text-white hover:text-black duration-200 py-2 px-4 rounded-lg'
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SaveImage