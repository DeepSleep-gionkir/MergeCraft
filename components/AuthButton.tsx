import React from 'react';
import { useGameStore } from '@/lib/store';
import { themes } from '@/lib/themes';
import clsx from 'clsx';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default function AuthButton() {
  const { user, isGuest, signInWithGoogle, signOut, theme } = useGameStore();
  const themeColors = themes[theme];

  const handleLogin = async () => {
    try {
        await signInWithGoogle();
    } catch (error) {
        console.error("Login failed", error);
        alert("로그인에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
        await signOut();
    }
  };

  if (isGuest) {
    return (
      <button
        onClick={handleLogin}
        className={clsx(
          "flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md border",
          themeColors.colors.accent,
          "text-white border-white/20"
        )}
      >
        <LogIn className="w-4 h-4" />
        <span>Login</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
        <div className={clsx("hidden md:flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10", themeColors.colors.textSecondary)}>
            {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-5 h-5 rounded-full" />
            ) : (
                <UserIcon className="w-4 h-4" />
            )}
            <span className="max-w-[100px] truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
        </div>
        
        <button
            onClick={handleLogout}
            className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md border bg-red-500/80 hover:bg-red-600/80",
            "text-white border-white/20"
            )}
            title="Logout"
        >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
        </button>
    </div>
  );
}
