export type Theme = 'cosmic' | 'nature' | 'cyberpunk';

export type ThemeConfig = {
  name: string;
  colors: {
    background: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentGlow: string;
  };
  gradients: {
    main: string;
    card: string;
    text: string;
  };
};

export const themes: Record<Theme, ThemeConfig> = {
  cosmic: {
    name: 'Cosmic',
    colors: {
      background: 'bg-[#050510]',
      cardBg: 'bg-indigo-950/40',
      cardBorder: 'border-indigo-500/30',
      textPrimary: 'text-indigo-50',
      textSecondary: 'text-indigo-300/70',
      accent: 'text-purple-400',
      accentGlow: 'shadow-purple-500/50',
    },
    gradients: {
      main: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0B1E] to-[#050510]',
      card: 'bg-gradient-to-br from-white/10 to-white/0',
      text: 'bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200',
    },
  },
  nature: {
    name: 'Nature',
    colors: {
      background: 'bg-[#051005]',
      cardBg: 'bg-emerald-950/40',
      cardBorder: 'border-emerald-500/30',
      textPrimary: 'text-emerald-50',
      textSecondary: 'text-emerald-300/70',
      accent: 'text-green-400',
      accentGlow: 'shadow-green-500/50',
    },
    gradients: {
      main: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-[#051005] to-[#020502]',
      card: 'bg-gradient-to-br from-white/10 to-white/0',
      text: 'bg-gradient-to-r from-emerald-200 via-green-200 to-teal-200',
    },
  },
  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      background: 'bg-[#0a0a12]',
      cardBg: 'bg-fuchsia-950/40',
      cardBorder: 'border-cyan-500/30',
      textPrimary: 'text-cyan-50',
      textSecondary: 'text-cyan-300/70',
      accent: 'text-pink-500',
      accentGlow: 'shadow-cyan-500/50',
    },
    gradients: {
      main: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0a0a12] to-black',
      card: 'bg-gradient-to-br from-cyan-500/10 to-pink-500/5',
      text: 'bg-gradient-to-r from-cyan-300 via-white to-pink-300',
    },
  },
};
