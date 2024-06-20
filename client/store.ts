import { create } from 'zustand'

export const useToolbarStore = create<ToolbarState>((set) => ({
    colorPicker: false,
    setColorPicker: (colorPicker: boolean) => set({ colorPicker: colorPicker }),
    color: '#000',
    setColor: (color: string) => set({ color: color }),
    brushEdit: false,
    setBrushEdit: (brushEdit: boolean) => set({ brushEdit: brushEdit }),
    brushThickness: 5,
    setBrushThickness: (brushThickness: number) => set({ brushThickness: brushThickness }),
    openCanvasBg: false,
    setOpenCanvasBg: (openCanvasBg: boolean) => set({ openCanvasBg: openCanvasBg })
}));

export const useSocketStore = create<SocketState>((set) => ({
    connected: false,
    setConnected: (connected: boolean) => set({ connected: connected })
}));

export const useInviteStore = create<InviteState>((set) => ({
    playerName: "",
    setPlayerName: (name: string) => set({ playerName: name }),
    roomType: "",
    setRoomType: (roomType: string) => set({ roomType: roomType }),
    invite: false,
    setInvite: (invite: boolean) => set({ invite: invite }),
    preference: "",
    setPreference: (preference: string) => set({ preference: preference }),
    roomID: "",
    setRoomID: (roomID: string) => set({ roomID: roomID })
}));