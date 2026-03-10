import { useEffect } from 'react';

import useGameStore from '../store/gameStore';

const BUG_LIFETIME_MS = 6000;

const formatLOC = (value: number): string => {
  if (value < 1_000) {
    return Math.floor(value).toString();
  }

  if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  if (value < 1_000_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  return `${(value / 1_000_000_000).toFixed(1)}B`;
};

export default function RandomBug() {
  const activeBug = useGameStore((state) => state.activeBug);
  const catchBug = useGameStore((state) => state.catchBug);
  const clearBug = useGameStore((state) => state.clearBug);

  useEffect(() => {
    if (!activeBug) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearBug();
    }, BUG_LIFETIME_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeBug, clearBug]);

  if (!activeBug) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={catchBug}
      className="group pointer-events-auto fixed z-40 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{
        left: `${activeBug.x}%`,
        top: `${activeBug.y}%`,
      }}
      aria-label={`捕获随机 Bug，奖励 ${Math.floor(activeBug.reward)} LOC`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-red-500/20 blur-2xl" />
      <span className="relative animate-bounce text-6xl drop-shadow-[0_0_20px_rgba(248,113,113,0.95)] transition duration-150 group-hover:scale-110">
        🐛
      </span>
      <span className="mt-2 rounded-full border border-red-400/35 bg-slate-950/90 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-red-300 shadow-[0_0_16px_rgba(248,113,113,0.25)]">
        +{formatLOC(activeBug.reward)} LOC
      </span>
    </button>
  );
}
