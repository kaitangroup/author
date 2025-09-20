'use client';
import React from 'react';
import '@dotlottie/player-component';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>, HTMLElement
      > & { src?: string; autoplay?: boolean; loop?: boolean; background?: string; speed?: number; };
    }
  }
}

export default function LoadingOverlay({ fullscreen = true, size = 160 }: { fullscreen?: boolean; size?: number }) {
  const inner = (
    <div className="flex items-center justify-center w-full h-full">
      <dotlottie-player src="/animations/loading.lottie" autoplay loop speed={1} style={{ width: size, height: size }} />
    </div>
  );
  if (!fullscreen) return inner;
  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm" role="status" aria-label="Loading">
      {inner}
    </div>
  );
}
