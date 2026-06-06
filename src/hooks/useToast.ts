import { useCallback, useRef, useState } from 'react';

export type ToastType = 'info' | 'success' | 'alert';

export interface ToastResult {
  toastMessage: string | null;
  toastType: ToastType;
  showToast: (message: string, type?: ToastType) => void;
}

/** Lightweight self-dismissing toast/banner state, shareable across screens. */
export function useToast(durationMs = 3500): ToastResult {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    if (timer.current) clearTimeout(timer.current);
    setToastMessage(message);
    setToastType(type);
    timer.current = setTimeout(() => setToastMessage(null), durationMs);
  }, [durationMs]);

  return { toastMessage, toastType, showToast };
}
