import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { themes } from '@/lib/themes';
import clsx from 'clsx';
import { FcGoogle } from 'react-icons/fc';
import { User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginOverlay() {
  const { hasSeenIntro, setHasSeenIntro, signInWithGoogle, user } = useGameStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if not visited AND not logged in
    // If user is logged in, initUser will set hasSeenIntro=true anyway, but just in case
    if (!hasSeenIntro && !user) {
        setIsVisible(true);
    } else {
        setIsVisible(false);
    }
  }, [hasSeenIntro, user]);

  const handleGoogleLogin = async () => {
    try {
        await signInWithGoogle();
        // Overlay will close automatically when user state updates or redirect happens
    } catch (error) {
        console.error("Login failed", error);
        alert("로그인에 실패했습니다.");
    }
  };

  const handleGuestLogin = () => {
    setHasSeenIntro(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-700" />

            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight relative z-10">
              MergeCraft
            </h1>
            <p className="text-white/60 mb-8 relative z-10">
              무한한 연금술의 세계로 떠나보세요.
            </p>

            <div className="space-y-4 relative z-10">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-bold py-3.5 rounded-xl hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg group"
              >
                <FcGoogle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Google 계정으로 시작</span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-white/40">또는</span>
                </div>
              </div>

              <button
                onClick={handleGuestLogin}
                className="w-full flex items-center justify-center gap-3 bg-white/5 text-white/80 font-medium py-3.5 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/10"
              >
                <User className="w-5 h-5 opacity-70" />
                <span>로그인 없이 시작하기 (Guest)</span>
              </button>
            </div>

            <p className="mt-6 text-xs text-white/30 relative z-10">
              게스트 모드 데이터는 브라우저에 저장됩니다.<br/>
              언제든 상단 메뉴에서 로그인하여 연동할 수 있습니다.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
