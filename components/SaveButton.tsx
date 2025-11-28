'use client';

import { useGameStore } from '@/lib/store';
import { themes } from '@/lib/themes';
import { motion } from 'framer-motion';
import { Save, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function SaveButton() {
  const { saveProgress, theme } = useGameStore();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const themeColors = themes[theme].colors;

  const handleSave = async () => {
    setStatus('saving');
    const success = await saveProgress();
    if (success) {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSave}
      disabled={status === 'saving'}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-colors font-medium text-sm",
        themeColors.cardBg,
        themeColors.cardBorder,
        themeColors.textPrimary,
        status === 'error' && "border-red-500 text-red-400"
      )}
    >
      {status === 'saving' ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : status === 'saved' ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      <span>
        {status === 'saving' ? '저장 중...' : 
         status === 'saved' ? '저장 완료' : 
         status === 'error' ? '실패' : '저장'}
      </span>
    </motion.button>
  );
}
