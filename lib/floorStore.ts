import { create } from "zustand";
import { Room, OverridesData, DayOrder, Cancellation, RoomClosure } from "@/lib/schemas";
import roomsData from "@/data/rooms.json";
import sectionsData from "@/data/sections.json";
import overridesData from "@/data/overrides.json";

export interface FilterState {
  floor: number | null;
  roomType: string | null;
  ac: "all" | "ac" | "non-ac";
  minCapacity: number;
  minFreeMinutes: number;
  hideLabs: boolean;
}

interface FloorManagerState {
  selectedDate: string;
  selectedTime: string;
  isLiveNow: boolean;
  strictReservation: boolean;
  activeView: "grid" | "timeline" | "list";
  filters: FilterState;
  rooms: Room[];
  enabledSections: Record<string, boolean>;
  overrides: OverridesData;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setLiveNow: (live: boolean) => void;
  setStrictReservation: (strict: boolean) => void;
  setActiveView: (view: "grid" | "timeline" | "list") => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  updateRoom: (room: Room) => void;
  toggleSection: (sectionId: string, enabled: boolean) => void;
  setOverrides: (overrides: OverridesData) => void;
  addDayOrder: (dayOrder: DayOrder) => void;
  deleteDayOrder: (index: number) => void;
  addCancellation: (cancellation: Cancellation) => void;
  deleteCancellation: (index: number) => void;
  addRoomClosure: (roomClosure: RoomClosure) => void;
  deleteRoomClosure: (index: number) => void;
}

const initialEnabledSections: Record<string, boolean> = {};
sectionsData.forEach((section) => {
  initialEnabledSections[section.id] = section.enabled;
});

const initialFilters: FilterState = {
  floor: null,
  roomType: null,
  ac: "all",
  minCapacity: 0,
  minFreeMinutes: 0,
  hideLabs: false,
};

export const useFloorStore = create<FloorManagerState>((set) => ({
  selectedDate: "2026-09-28",
  selectedTime: "10:15",
  isLiveNow: false,
  strictReservation: false,
  activeView: "grid",
  filters: initialFilters,
  rooms: roomsData as unknown as Room[],
  enabledSections: initialEnabledSections,
  overrides: overridesData as unknown as OverridesData,
  setDate: (selectedDate) => set({ selectedDate, isLiveNow: false }),
  setTime: (selectedTime) => set({ selectedTime, isLiveNow: false }),
  setLiveNow: (isLiveNow) => set({ isLiveNow }),
  setStrictReservation: (strictReservation) => set({ strictReservation }),
  setActiveView: (activeView) => set({ activeView }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: initialFilters }),
  updateRoom: (updated) => set((state) => ({
    rooms: state.rooms.map((room) => room.id === updated.id ? updated : room),
  })),
  toggleSection: (sectionId, enabled) => set((state) => ({
    enabledSections: { ...state.enabledSections, [sectionId]: enabled },
  })),
  setOverrides: (overrides) => set({ overrides }),
  addDayOrder: (dayOrder) => set((state) => ({
    overrides: { ...state.overrides, dayOrders: [...state.overrides.dayOrders, dayOrder] },
  })),
  deleteDayOrder: (index) => set((state) => ({
    overrides: { ...state.overrides, dayOrders: state.overrides.dayOrders.filter((_, i) => i !== index) },
  })),
  addCancellation: (cancellation) => set((state) => ({
    overrides: { ...state.overrides, cancellations: [...state.overrides.cancellations, cancellation] },
  })),
  deleteCancellation: (index) => set((state) => ({
    overrides: { ...state.overrides, cancellations: state.overrides.cancellations.filter((_, i) => i !== index) },
  })),
  addRoomClosure: (roomClosure) => set((state) => ({
    overrides: { ...state.overrides, roomClosures: [...state.overrides.roomClosures, roomClosure] },
  })),
  deleteRoomClosure: (index) => set((state) => ({
    overrides: { ...state.overrides, roomClosures: state.overrides.roomClosures.filter((_, i) => i !== index) },
  })),
}));