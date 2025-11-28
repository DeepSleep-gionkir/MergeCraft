import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Element } from '@/types';
import { Theme } from './themes';
import { supabase } from './supabase';

interface GameState {
  inventory: Element[];
  workspace: Element[];
  theme: Theme;
  userId: string | null;
  addToInventory: (element: Element) => void;
  addToWorkspace: (element: Element) => void;
  removeFromWorkspace: (elementId: number) => void;
  clearWorkspace: () => void;
  setInventory: (inventory: Element[]) => void;
  setTheme: (theme: Theme) => void;
  initUser: () => Promise<void>;
  saveProgress: () => Promise<boolean>;
  markAsSeen: (elementIds: number[]) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      inventory: [
        { id: 1, text: '물', emoji: '💧', is_first_discovery: false, created_at: new Date().toISOString() },
        { id: 2, text: '불', emoji: '🔥', is_first_discovery: false, created_at: new Date().toISOString() },
        { id: 3, text: '흙', emoji: '🌍', is_first_discovery: false, created_at: new Date().toISOString() },
        { id: 4, text: '바람', emoji: '💨', is_first_discovery: false, created_at: new Date().toISOString() },
      ],
      workspace: [],
      theme: 'cosmic',
      userId: null,
      
      initUser: async () => {
        let { userId } = get();
        if (!userId) {
          userId = crypto.randomUUID();
          set({ userId });
        }
        
        // Sync with Supabase
        if (userId) {
            const { data } = await supabase
                .from('user_progress')
                .select('element_id, elements(*)')
                .eq('user_id', userId);
            
            if (data && data.length > 0) {
                const syncedInventory = data.map((item: any) => item.elements) as Element[];
                // Merge with local inventory (deduplicate)
                set((state) => {
                    const combined = [...state.inventory];
                    syncedInventory.forEach(newEl => {
                        if (!combined.some(e => e.id === newEl.id)) {
                            combined.push(newEl);
                        }
                    });
                    return { inventory: combined };
                });
            }
        }
      },

      addToInventory: (element) => {
        const { inventory } = get();
        if (inventory.some((e) => e.id === element.id)) {
            return;
        }
        set({ inventory: [...inventory, element] });
      },

      saveProgress: async () => {
        const { inventory, userId } = get();
        if (!userId) return false;

        // Get already saved elements to avoid duplicates (or just use upsert/ignore)
        // For simplicity, we'll just try to insert all and ignore conflicts if possible, 
        // but Supabase insert doesn't support ignore on conflict easily without upsert.
        // Better approach: Get IDs from DB, filter local inventory, insert new ones.
        
        try {
            const { data: savedData } = await supabase
                .from('user_progress')
                .select('element_id')
                .eq('user_id', userId);
            
            const savedIds = new Set(savedData?.map((d: any) => d.element_id));
            const newElements = inventory.filter(e => !savedIds.has(e.id));

            if (newElements.length > 0) {
                const { error } = await supabase.from('user_progress').insert(
                    newElements.map(e => ({
                        user_id: userId,
                        element_id: e.id
                    }))
                );
                if (error) throw error;
            }
            return true;
        } catch (e) {
            console.error("Save failed", e);
            return false;
        }
      },

      addToWorkspace: (element) =>
        set((state) => {
            if (state.workspace.length >= 2) return state;
            return { workspace: [...state.workspace, element] };
        }),
      removeFromWorkspace: (elementId) =>
        set((state) => ({
          workspace: state.workspace.filter((e) => e.id !== elementId),
        })),
      clearWorkspace: () => set({ workspace: [] }),
      markAsSeen: (elementIds) =>
        set((state) => ({
          inventory: state.inventory.map((e) =>
            elementIds.includes(e.id) ? { ...e, is_first_discovery: false } : e
          ),
        })),
      setInventory: (inventory) => set({ inventory }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'mergecraft-storage',
    }
  )
);
