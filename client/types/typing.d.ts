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
    colorPicker: boolean,
    setColorPicker: Dispatch<SetStateAction<boolean>>,
    color: string,
    setColor: Dispatch<SetStateAction<string>>,
    brushEdit: boolean,
    setBrushEdit: Dispatch<SetStateAction<boolean>>,
    brushThickness: number,
    setBrushThickness: Dispatch<SetStateAction<number>>,
    openCanvasBg: boolean,
    setOpenCanvasBg: Dispatch<SetStateAction<boolean>>
};

// type SocketState = {}

type InviteState = {
    playerName: string,
    setPlayerName: Dispatch<SetStateAction<string>>,
    roomType: string,
    setRoomType: Dispatch<SetStateAction<string>>,
    invite: boolean,
    setInvite: Dispatch<SetStateAction<boolean>>,
    preference: string, 
    setPreference: Dispatch<SetStateAction<string>>,
    roomID: string, 
    setRoomID: Dispatch<SetStateAction<string>>
};