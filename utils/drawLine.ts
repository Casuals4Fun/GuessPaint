type DrawLineProp = Draw & {
    color: string,
    brushThickness: number
}

export const drawLine = ({ prevPoint, currPoint, ctx, color, brushThickness }: DrawLineProp) => {
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