type Point = { x: number, y: number };

type Draw = {
    ctx: CanvasRenderingContext2D,
    currPoint: Point,
    prevPoint: Point | null
};

type DrawLineProps = Draw & {
    color: string,
    brushThickness: number,
    canvasBg: string,
};

type ToolbarState = {
    bgSelect: boolean,
    setBgSelect: Dispatch<SetStateAction<boolean>>,
    canvasBg: string,
    setCanvasBg: Dispatch<SetStateAction<string>>,
    colorPicker: boolean,
    setColorPicker: Dispatch<SetStateAction<boolean>>,
    color: string,
    setColor: Dispatch<SetStateAction<string>>,
    brushEdit: boolean,
    setBrushEdit: Dispatch<SetStateAction<boolean>>,
    brushThickness: number,
    setBrushThickness: Dispatch<SetStateAction<number>>
    downloadSelect: boolean,
    setDownloadSelect: Dispatch<SetStateAction<boolean>>,
    downloadCanvasWidth: number,
    setDownloadCanvasWidth: Dispatch<SetStateAction<number>>,
    downloadCanvasHeight: number,
    setDownloadCanvasHeight: Dispatch<SetStateAction<number>>,
    openCanvasBg: boolean,
    setOpenCanvasBg: Dispatch<SetStateAction<boolean>>,
    downloadCanvasBg: string,
    setDownloadCanvasBg: Dispatch<SetStateAction<string>>
};

type SocketState = {
    connected: boolean,
    setConnected: Dispatch<SetStateAction<boolean>>
}

type InviteState = {
    roomType: string,
    setRoomType: Dispatch<SetStateAction<string>>,
    invite: boolean,
    setInvite: Dispatch<SetStateAction<boolean>>,
    preference: string, 
    setPreference: Dispatch<SetStateAction<string>>,
    roomID: string, 
    setRoomID: Dispatch<SetStateAction<string>>
};