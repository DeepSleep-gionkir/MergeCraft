'use client';

import { useGameStore } from '@/lib/store';
import ElementCard from './ElementCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Trash2, Plus } from 'lucide-react';
import { Element } from '@/types';
import { themes } from '@/lib/themes';
import clsx from 'clsx';

export default function Workspace() {
  const { workspace, removeFromWorkspace, clearWorkspace, addToInventory, theme, markAsSeen, inventory } = useGameStore();
  const [isCombining, setIsCombining] = useState(false);
  const [result, setResult] = useState<Element | null>(null);
  const [error, setError] = useState<string | null>(null);
  const themeColors = themes[theme].colors;

  useEffect(() => {
    if (workspace.length === 2 && !isCombining && !result) {
      combineElements();
    }
  }, [workspace]);

  const combineElements = async () => {
    setIsCombining(true);
    setError(null);
    
    // Mark used elements as seen
    markAsSeen(workspace.map(e => e.id));

    try {
      const response = await fetch('/api/combine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elementA_ID: workspace[0].id,
          elementB_ID: workspace[1].id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '조합 실패');
      }

      // Only delay if it's a global new discovery (AI generated)
      if (data.isNewDiscovery) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      const finalResult = {
        ...data.result,
        is_first_discovery: data.isNewDiscovery
      };

      setResult(finalResult);
      addToInventory(finalResult);
      
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => {
          clearWorkspace();
          setError(null);
      }, 2000);
    } finally {
      setIsCombining(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    clearWorkspace();
  };

  return (
    <div className="flex-1 h-full relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
      {/* Dynamic Background */}
      <div className={clsx("absolute inset-0 pointer-events-none transition-colors duration-1000", themes[theme].gradients.main)} />
      
      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
            animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={clsx("absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] opacity-20 will-change-transform transform-gpu", theme === 'nature' ? 'bg-emerald-500' : 'bg-purple-600')} 
        />
        <motion.div 
            animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className={clsx("absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 will-change-transform transform-gpu", theme === 'cyberpunk' ? 'bg-pink-600' : 'bg-blue-600')} 
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-20 pointer-events-none mix-blend-overlay" />

      <div className="relative z-10 w-full max-w-3xl aspect-video flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center gap-8 md:gap-12"
            >
              <div className="relative group">
                <div className={clsx("absolute inset-0 blur-[80px] rounded-full opacity-50 transition-colors duration-1000", theme === 'nature' ? 'bg-emerald-500' : 'bg-purple-500')} />
                <div className={clsx("absolute inset-0 blur-[30px] rounded-full opacity-70 animate-pulse", theme === 'nature' ? 'bg-emerald-400' : 'bg-purple-400')} />
                
                <ElementCard 
                    element={result} 
                    className={clsx("w-48 h-48 md:w-64 md:h-64 text-7xl md:text-9xl shadow-2xl border-4 z-10 relative", themeColors.accentGlow, themeColors.cardBorder)} 
                />
                
                {result.is_first_discovery && (
                    <motion.div 
                        initial={{ y: 20, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 text-white font-black px-8 py-3 rounded-full shadow-[0_0_30px_rgba(255,165,0,0.6)] flex items-center gap-3 z-20 border-2 border-white/30 text-base md:text-lg tracking-wide"
                    >
                        <Sparkles className="w-6 h-6 animate-spin-slow" /> NEW DISCOVERY!
                    </motion.div>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className={clsx(
                    "px-12 py-4 rounded-full border-2 transition-all duration-300 font-black shadow-xl text-base md:text-lg backdrop-blur-xl uppercase tracking-widest",
                    themeColors.cardBg,
                    themeColors.cardBorder,
                    themeColors.textPrimary,
                    "hover:bg-white/20 hover:shadow-2xl hover:border-white/50"
                )}
              >
                Continue
              </motion.button>
            </motion.div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-[2vmin] sm:gap-8 w-full px-4">
               {/* Slot 1 */}
               <div className="relative group flex-1 flex justify-center sm:justify-end w-full sm:w-auto">
                 <div className={clsx("absolute inset-0 bg-gradient-to-b from-transparent to-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500")} />
                 {workspace[0] ? (
                    <motion.div layoutId="slot1" className="relative z-10">
                        <ElementCard 
                            element={workspace[0]} 
                            onClick={() => removeFromWorkspace(workspace[0].id)}
                            className="w-[28vmin] h-[28vmin] md:w-52 md:h-52 text-[8vmin] md:!text-7xl shadow-2xl border-2"
                        />
                    </motion.div>
                 ) : (
                    <motion.div 
                        layoutId="slot1"
                        className={clsx("w-[28vmin] h-[28vmin] md:w-52 md:h-52 rounded-3xl border-4 border-dashed flex items-center justify-center transition-all duration-300 relative z-10", themeColors.cardBorder, themeColors.textSecondary, "group-hover:border-white/40 group-hover:bg-white/5 group-hover:scale-105")}
                    >
                        <div className="w-[14vmin] h-[14vmin] md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm">
                            <Plus className="w-[6vmin] h-[6vmin] md:w-8 md:h-8 opacity-30" />
                        </div>
                    </motion.div>
                 )}
               </div>

               {/* Connection / Status */}
               <div className="flex flex-col items-center justify-center w-[10vmin] md:w-32 relative z-10 shrink-0 rotate-90 sm:rotate-0 my-2 sm:my-0">
                  {/* Energy Line */}
                  <div className={clsx("absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 rounded-full overflow-hidden hidden sm:block", themeColors.cardBg)}>
                    <div className={clsx("absolute inset-0 w-full h-full animate-pulse opacity-50", theme === 'nature' ? 'bg-emerald-500' : 'bg-purple-500')} />
                  </div>

                  {isCombining ? (
                      <div className="relative p-[2vmin] md:p-4 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl">
                          <div className={clsx("absolute inset-0 blur-xl opacity-80 animate-pulse rounded-full", themeColors.accent)} />
                          <Loader2 className={clsx("w-[6vmin] h-[6vmin] md:w-12 md:h-12 animate-spin relative z-10", themeColors.accent)} />
                      </div>
                  ) : (
                      <div className={clsx("relative p-[1.5vmin] md:p-3 rounded-full transition-colors duration-300 bg-black/30 backdrop-blur-md border border-white/5 shadow-lg", themeColors.cardBg)}>
                        <Plus className={clsx("w-[4vmin] h-[4vmin] md:w-8 md:h-8 opacity-70", themeColors.textSecondary)} />
                      </div>
                  )}
               </div>

               {/* Slot 2 */}
               <div className="relative group flex-1 flex justify-center sm:justify-start w-full sm:w-auto">
                 <div className={clsx("absolute inset-0 bg-gradient-to-b from-transparent to-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500")} />
                 {workspace[1] ? (
                    <motion.div layoutId="slot2" className="relative z-10">
                        <ElementCard 
                            element={workspace[1]} 
                            onClick={() => removeFromWorkspace(workspace[1].id)}
                            className="w-[28vmin] h-[28vmin] md:w-52 md:h-52 text-[8vmin] md:!text-7xl shadow-2xl border-2"
                        />
                    </motion.div>
                 ) : (
                    <motion.div 
                        layoutId="slot2"
                        className={clsx("w-[28vmin] h-[28vmin] md:w-52 md:h-52 rounded-3xl border-4 border-dashed flex items-center justify-center transition-all duration-300 relative z-10", themeColors.cardBorder, themeColors.textSecondary, "group-hover:border-white/40 group-hover:bg-white/5 group-hover:scale-105")}
                    >
                        <div className="w-[14vmin] h-[14vmin] md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm">
                            <Plus className="w-[6vmin] h-[6vmin] md:w-8 md:h-8 opacity-30" />
                        </div>
                    </motion.div>
                 )}
               </div>
            </div>
          )}
        </AnimatePresence>

        {error && (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-4 md:bottom-8 text-red-200 bg-red-900/80 px-6 py-3 rounded-full border border-red-500/30 backdrop-blur-xl shadow-xl font-medium text-sm z-50"
            >
                {error}
            </motion.div>
        )}

        {!result && !isCombining && workspace.length === 0 && (
            <div className={clsx("mt-8 text-sm md:text-base animate-pulse font-medium tracking-wide opacity-60 text-center", themeColors.textSecondary)}>
                인벤토리에서 재료를 선택하세요
            </div>
        )}
        
        {!result && !isCombining && workspace.length > 0 && (
            <button 
                onClick={clearWorkspace}
                className={clsx("mt-8 p-3 rounded-full transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 group", themeColors.textSecondary)}
                title="비우기"
            >
                <Trash2 className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
            </button>
        )}

      </div>
    </div>
  );
}
