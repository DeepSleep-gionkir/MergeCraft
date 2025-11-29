import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Element } from '@/types';
import { Theme } from './themes';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface GameState {
  inventory: Element[];
  workspace: Element[];
  theme: Theme;
  user: User | null; // Supabase Authenticated User
  isGuest: boolean;
  hasVisited: boolean;
  knownRecipes: Record<string, Element>; // Cache for known recipes: "idA-idB" -> ResultElement
  addToInventory: (element: Element) => void;
  addToWorkspace: (element: Element) => void;
  removeFromWorkspace: (elementId: number) => void;
  clearWorkspace: () => void;
  setInventory: (inventory: Element[]) => void;
  setTheme: (theme: Theme) => void;
  setHasVisited: (hasVisited: boolean) => void;
  addKnownRecipe: (idA: number, idB: number, result: Element) => void;
  initUser: () => Promise<void>;
  saveProgress: () => Promise<boolean>;
  markAsSeen: (elementIds: number[]) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
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
      user: null,
      isGuest: true,
      hasVisited: false,
      knownRecipes: {},
      
      initUser: async () => {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
            set({ user: session.user, isGuest: false, hasVisited: true });
            // Load data for logged in user
            await get().saveProgress(); // Sync local to cloud first (optional strategy) or just load
            // Actually, better to load cloud data and merge
            await loadCloudData(session.user.id, set, get);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                set({ user: session.user, isGuest: false, hasVisited: true });
                await loadCloudData(session.user.id, set, get);
            } else {
                set({ user: null, isGuest: true });
                // If logging out, we might want to reset hasVisited to show login screen again?
                // Or keep it true so they stay as guest?
                // User requirement: "Guest login button... play... then click Google Login"
                // So logout should probably just make them guest, not force overlay again immediately unless they refresh?
                // Actually, if they explicitly logout, they are guest.
            }
        });
      },

      setHasVisited: (hasVisited) => set({ hasVisited }),

      addKnownRecipe: (idA, idB, result) => {
        const key = `${Math.min(idA, idB)}-${Math.max(idA, idB)}`;
        set((state) => ({
            knownRecipes: { ...state.knownRecipes, [key]: result }
        }));
      },

      signInWithGoogle: async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, isGuest: true });
      },

      addToInventory: (element) => {
        const { inventory } = get();
        if (inventory.some((e) => e.id === element.id)) {
            return;
        }
        const newInventory = [...inventory, element];
        set({ inventory: newInventory });
        
        // Auto-save if logged in
        const { user } = get();
        if (user) {
             get().saveProgress();
        }
      },

      saveProgress: async () => {
        const { inventory, user } = get();
        if (!user) return false;

        try {
            const { data: savedData } = await supabase
                .from('user_progress')
                .select('element_id')
                .eq('user_id', user.id);
            
            const savedIds = new Set(savedData?.map((d: any) => d.element_id));
            const newElements = inventory.filter(e => !savedIds.has(e.id));

            if (newElements.length > 0) {
                const { error } = await supabase.from('user_progress').insert(
                    newElements.map(e => ({
                        user_id: user.id,
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

// Helper to load cloud data
async function loadCloudData(userId: string, set: any, get: any) {
    const { data } = await supabase
        .from('user_progress')
        .select('element_id, elements(*)')
        .eq('user_id', userId);
    
    if (data && data.length > 0) {
        const syncedInventory = data.map((item: any) => item.elements) as Element[];
        set((state: GameState) => {
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
