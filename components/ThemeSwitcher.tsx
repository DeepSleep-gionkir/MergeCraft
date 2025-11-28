'use client';

import { useGameStore } from '@/lib/store';
import { themes, Theme } from '@/lib/themes';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "p-2 rounded-full backdrop-blur-md border transition-colors",
          themes[theme].colors.cardBg,
          themes[theme].colors.cardBorder,
          themes[theme].colors.textPrimary
        )}
      >
        <Palette className="w-5 h-5" />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={clsx(
            "absolute top-12 right-0 p-2 rounded-xl border backdrop-blur-xl min-w-[120px] flex flex-col gap-1 shadow-xl",
            themes[theme].colors.cardBg,
            themes[theme].colors.cardBorder
          )}
        >
          {(Object.keys(themes) as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setIsOpen(false);
              }}
              className={clsx(
                "px-3 py-2 rounded-lg text-sm text-left transition-colors flex items-center gap-2",
                theme === t ? "bg-white/10" : "hover:bg-white/5",
                themes[theme].colors.textPrimary
              )}
            >
              <div className={clsx("w-2 h-2 rounded-full", 
                t === 'cosmic' ? 'bg-purple-500' : 
                t === 'nature' ? 'bg-emerald-500' : 'bg-cyan-500'
              )} />
              {themes[t].name}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
