'use client';

import { Element } from '@/types';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useGameStore } from '@/lib/store';
import { themes } from '@/lib/themes';
import React from 'react';

interface ElementCardProps {
  element: Element;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
  layout?: 'grid' | 'list';
}

const ElementCard = React.memo(({ element, onClick, className, compact = false, layout = 'grid' }: ElementCardProps) => {
  const { theme } = useGameStore();
  const themeColors = themes[theme].colors;

  // Handle multiple emojis
  const emojis = [...element.emoji];
  const isMultiEmoji = emojis.length > 1;
  const displayEmoji = isMultiEmoji ? emojis.slice(0, 4) : emojis.slice(0, 1); // Limit to 4 for grid

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        'relative border cursor-pointer transition-all duration-300 select-none shadow-xl backdrop-blur-xl overflow-hidden group transform-gpu',
        layout === 'grid' 
            ? 'flex flex-col items-center justify-center rounded-2xl' 
            : 'flex flex-row items-center justify-start px-4 py-5 gap-4 rounded-xl w-full',
        layout === 'grid' && (compact ? 'p-2 gap-1' : 'p-4 gap-2'),
        themeColors.cardBg,
        themeColors.cardBorder,
        className
      )}
    >
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
      
      {/* Gradient Border on Hover */}
      <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Glow effect */}
      <div className={clsx("absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white to-transparent mix-blend-overlay")} />
      
      <div className={clsx("z-10 drop-shadow-2xl filter shrink-0 flex flex-wrap items-center justify-center gap-1",
        layout === 'grid' 
            ? (compact ? "w-full" : "w-48") 
            : "w-auto"
      )}>
        {isMultiEmoji ? (
            displayEmoji.map((emoji, i) => (
                <span key={i} className={clsx(
                    "leading-none",
                    layout === 'grid'
                        ? (compact ? "text-xs" : "text-4xl")
                        : "text-2xl"
                )}>{emoji}</span>
            ))
        ) : (
            <span className={clsx(
                "leading-none",
                layout === 'grid' 
                    ? (compact ? "text-3xl" : "text-5xl") 
                    : "text-3xl"
            )}>{displayEmoji.join('')}</span>
        )}
      </div>
      
      <span className={clsx("font-bold z-10 leading-tight tracking-tight truncate", 
        layout === 'grid' ? "text-center" : "text-left flex-1",
        layout === 'grid' ? (compact ? "text-[10px]" : "text-sm") : "text-sm",
        themeColors.textPrimary
      )}>{element.text}</span>
      
      {element.is_first_discovery && (
        <span className={clsx("flex h-2 w-2 shrink-0", layout === 'grid' ? "absolute top-2 right-2" : "")}>
            <span className={clsx("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", theme === 'nature' ? 'bg-emerald-400' : 'bg-purple-400')}></span>
            <span className={clsx("relative inline-flex rounded-full h-2 w-2", theme === 'nature' ? 'bg-emerald-500' : 'bg-purple-500')}></span>
        </span>
      )}
    </motion.div>
  );
});

ElementCard.displayName = 'ElementCard';

export default ElementCard;
