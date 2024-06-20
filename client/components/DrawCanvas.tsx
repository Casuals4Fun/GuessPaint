"use client"

import React from 'react';
import { useDraw } from '@/hooks/useDraw';
import { useToolbarStore } from '@/store';
import CanvasToolbar from './CanvasToolbar';
import SaveImage from './SaveImage';

interface SizeProp {
    width: number,
    height: number
}

const DrawCanvas = ({ width, height }: SizeProp) => {
    const { canvasBg, brushThickness, color, downloadSelect } = useToolbarStore();

    const { canvasRef, onMouseDown, clear } = useDraw(drawLine);

    function drawLine({ prevPoint, currPoint, ctx }: Draw) {
        const { x: currX, y: currY } = currPoint;

        const lineWidth = brushThickness;
        const lineColor = color;

        let startPoint = prevPoint ?? currPoint;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineColor;
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currX, currY);
        ctx.stroke();
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    };

    return (
        <div className='relative'>
            <CanvasToolbar
                clear={clear}
            />

            <canvas
                className='cursor-crosshair'
                width={`${width}px`}
                height={`${height}px`}
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
                style={{ background: canvasBg }}
            />

            {/* {downloadSelect && <SaveImage canvasRef={canvasRef} />} */}
        </div>
    )
}

export default DrawCanvas