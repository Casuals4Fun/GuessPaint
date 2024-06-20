import React from "react";

export const downloadDrawing = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    downloadCanvasBg: string, canvasBg: string,
    downloadCanvasWidth: number, downloadCanvasHeight: number
) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = downloadCanvasWidth;
    tempCanvas.height = downloadCanvasHeight;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.fillStyle = downloadCanvasBg === '#fff' ? canvasBg : downloadCanvasBg;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const imageURL = tempCanvas.toDataURL();
    const downloadLink = document.createElement('a');
    downloadLink.href = imageURL;
    downloadLink.download = 'drawing.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};