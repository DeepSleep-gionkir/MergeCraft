'use client';

import Inventory from '@/components/Inventory';
import Workspace from '@/components/Workspace';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import AuthButton from '@/components/AuthButton';
import LoginOverlay from '@/components/LoginOverlay';
import { useGameStore } from '@/lib/store';
import { useEffect } from 'react';

export default function Home() {
  const { initUser } = useGameStore();

  useEffect(() => {
    initUser();
  }, []);

  return (
    <main className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-black">
      {/* Inventory: Mobile Bottom (40%), Desktop Left (320px) */}
      <div className="order-2 md:order-1 h-[40%] md:h-full w-full md:w-[340px] shrink-0 z-20 shadow-2xl md:shadow-none">
        <Inventory />
      </div>
      
      {/* Workspace: Mobile Top (60%), Desktop Right (Rest) */}
      <div className="order-1 md:order-2 flex-1 flex flex-col h-[60%] md:h-full relative z-10">
        <header className="absolute top-0 left-0 w-full p-4 z-30 flex justify-between items-start pointer-events-none">
            <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-lg filter backdrop-blur-sm">
                    MergeCraft
                </h1>
                <span className="text-[10px] md:text-xs text-white/50 font-medium tracking-widest uppercase ml-1">Infinite Alchemy</span>
            </div>
            <div className="pointer-events-auto flex items-center gap-3">
                <AuthButton />
                <ThemeSwitcher />
            </div>
        </header>
        <Workspace />
      </div>
    </main>
  );
}
