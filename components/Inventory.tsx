'use client';

import { useGameStore } from '@/lib/store';
import ElementCard from './ElementCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { themes } from '@/lib/themes';
import clsx from 'clsx';

export default function Inventory() {
  const { inventory, addToWorkspace, theme } = useGameStore();
  const [search, setSearch] = useState('');
  const themeColors = themes[theme].colors;

  const filteredInventory = inventory.filter((el) =>
    el.text.includes(search)
  );

  return (
    <div className={clsx("w-full h-full border-t md:border-t-0 md:border-r flex flex-col backdrop-blur-2xl transition-colors duration-500 shadow-2xl z-30", themeColors.cardBg, themeColors.cardBorder)}>
      <div className={clsx("p-3 border-b flex gap-2 items-center bg-black/20", themeColors.cardBorder)}>
        <div className="relative group flex-1">
          <Search className={clsx("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", themeColors.textSecondary, "group-focus-within:text-white")} />
          <input
            type="text"
            placeholder="Search elements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={clsx(
                "w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none transition-all duration-300 text-sm font-semibold tracking-wide",
                "bg-white/5 border-white/5 focus:border-white/20 focus:bg-black/40",
                themeColors.textPrimary,
                "placeholder:text-white/20"
            )}
          />
        </div>
        <div className={clsx("text-[10px] font-black px-2 py-1.5 rounded-md border bg-white/5 min-w-[3rem] text-center", themeColors.cardBorder, themeColors.textSecondary)}>
            {inventory.length}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 content-start custom-scrollbar">
        {filteredInventory.map((element) => (
          <ElementCard
            key={element.id}
            element={element}
            onClick={() => addToWorkspace(element)}
            className="hover:z-10"
            layout="list"
          />
        ))}
        {filteredInventory.length === 0 && (
          <div className={clsx("text-center py-20 text-sm flex flex-col items-center gap-3 opacity-40", themeColors.textSecondary)}>
            <Search className="w-10 h-10" />
            <span className="font-medium">No elements found</span>
          </div>
        )}
      </div>
    </div>
  );
}
