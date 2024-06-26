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
    setBrushThickness: Dispatch<SetStateAction<number>>
};

type InviteState = {
    roomType: string,
    setRoomType: Dispatch<SetStateAction<string>>,
    invite: boolean,
    setInvite: Dispatch<SetStateAction<boolean>>,
    preference: string, 
    setPreference: Dispatch<SetStateAction<string>>
};

type SidebarState = {
    players: string[];
    setPlayers: (players: string[] | ((prevPlayers: string[]) => string[])) => void;
    addPlayer: (player: string) => void;
    assignedPlayerName: string;
    setAssignedPlayerName: Dispatch<SetStateAction<string>>;
};