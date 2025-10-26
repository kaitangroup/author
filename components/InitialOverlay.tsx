'use client';

import { useEffect, useState } from 'react';

type Props = {
  /** minimum time to show the overlay (ms) */
  minMs?: number;
  /** show only once per browser tab */
  oncePerTab?: boolean;
};

export default function InitialOverlay({ minMs = 400, oncePerTab = true }: Props) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // If we've already shown it in this tab, skip
    if (oncePerTab && typeof window !== 'undefined' && sessionStorage.getItem('initial-overlay-shown')) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
      if (oncePerTab) sessionStorage.setItem('initial-overlay-shown', '1');
    }, Math.max(0, minMs));

    return () => clearTimeout(timer);
  }, [minMs, oncePerTab]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white/80 backdrop-blur-sm">
      {/* Simple spinner */}
      <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent" />
      {/* Optional brand text */}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
