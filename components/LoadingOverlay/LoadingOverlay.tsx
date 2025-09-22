"use client";

import dynamic from "next/dynamic";

const DotLottiePlayer = dynamic(
  async () => {
    await import("@dotlottie/player-component");
    return (props: any) => <dotlottie-player {...props} />;
  },
  { ssr: false }
);

export default function LoadingOverlay({
  fullscreen = true,
  size = 160,
}: {
  fullscreen?: boolean;
  size?: number;
}) {
  const inner = (
    <div className="flex items-center justify-center w-full h-full">
      <DotLottiePlayer
        src="/animations/Loading.lottie"
        autoplay
        loop
        speed={1}
        style={{ width: size, height: size }}
      />
    </div>
  );

  return fullscreen ? (
    <div
      className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm"
      role="status"
      aria-label="Loading"
    >
      {inner}
    </div>
  ) : (
    inner
  );
}
