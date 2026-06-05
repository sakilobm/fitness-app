import React from 'react';

export interface Palette {
  bg: string;
  card: string;
  cardBorder: string;
  glass: string;
  glassBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGlow: string;
  statusBar: 'light-content' | 'dark-content';
}

export const DARK_PALETTE: Palette = {
  bg: '#0A0A0F',
  card: '#13131A',
  cardBorder: '#1E1E2E',
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.10)',
  textPrimary: '#F0F0F8',
  textSecondary: '#8B8BA8',
  textMuted: '#4A4A65',
  accent: '#2E7D5E',
  accentGlow: 'rgba(46,125,94,0.25)',
  statusBar: 'light-content',
};

export const LIGHT_PALETTE: Palette = {
  bg: '#F4F3EF',
  card: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.08)',
  glass: 'rgba(0,0,0,0.03)',
  glassBorder: 'rgba(0,0,0,0.10)',
  textPrimary: '#1C1C2E',
  textSecondary: '#6B6B88',
  textMuted: '#A0A0B8',
  accent: '#2E7D5E',
  accentGlow: 'rgba(46,125,94,0.15)',
  statusBar: 'dark-content',
};

export const ThemeCtx = React.createContext<Palette>(DARK_PALETTE);
export const useT = () => React.useContext(ThemeCtx);
