import { create } from 'zustand'

export const useToolbarStore = create<ToolbarState>((set) => ({
    colorPicker: false,
    setColorPicker: (colorPicker: boolean) => set({ colorPicker: colorPicker }),
    color: '#000',
    setColor: (color: string) => set({ color: color }),
    brushEdit: false,
    setBrushEdit: (brushEdit: boolean) => set({ brushEdit: brushEdit }),
    brushThickness: 5,
    setBrushThickness: (brushThickness: number) => set({ brushThickness: brushThickness })
}));

export const useInviteStore = create<InviteState>((set) => ({
    roomType: "",
    setRoomType: (roomType: string) => set({ roomType: roomType }),
    invite: false,
    setInvite: (invite: boolean) => set({ invite: invite }),
    preference: "",
    setPreference: (preference: string) => set({ preference: preference })
}));

export const useSidebarStore = create<SidebarState>((set) => ({
    players: [],
    setPlayers: (players) => set((state) => ({ players: typeof players === 'function' ? players(state.players) : players })),
    addPlayer: (player: string) => set((state) => ({ players: [...state.players, player] })),
    assignedPlayerName: localStorage.getItem('playerName') || "",
    setAssignedPlayerName: (playerName: string) => set({ assignedPlayerName: playerName })
}));