import { useEffect, useMemo, useState } from 'react';

import useGameStore from '../store/gameStore';

const CONFIRM_TIMEOUT_MS = 4000;
const PRESTIGE_DELTA_THRESHOLD = 0.1;

const formatMultiplier = (value: number): string => {
  return `${value.toFixed(2)}x`;
};

export default function Prestige() {
  const lifetimeLOC = useGameStore((state) => state.lifetimeLOC);
  const prestigeMultiplier = useGameStore((state) => state.prestigeMultiplier);
  const doPrestige = useGameStore((state) => state.doPrestige);

  const [isConfirming, setIsConfirming] = useState(false);

  const nextPrestigeMultiplier = useMemo(() => {
    return 1 + Math.sqrt(lifetimeLOC / 100000);
  }, [lifetimeLOC]);

  const prestigeGain = nextPrestigeMultiplier - prestigeMultiplier;
  const canPrestige = prestigeGain >= PRESTIGE_DELTA_THRESHOLD;

  useEffect(() => {
    if (!isConfirming) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsConfirming(false);
    }, CONFIRM_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isConfirming]);

  useEffect(() => {
    if (!canPrestige && isConfirming) {
      setIsConfirming(false);
    }
  }, [canPrestige, isConfirming]);

  if (!canPrestige) {
    return null;
  }

  const handleClick = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    doPrestige();
    setIsConfirming(false);
  };

  return (
    <section className="mt-5 rounded-3xl border border-amber-400/20 bg-slate-900/80 p-4 shadow-[0_0_28px_rgba(251,191,36,0.08)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-300/75">
        High Risk Protocol
      </p>
      <h3 className="mt-2 font-mono text-lg font-semibold text-amber-200">
        删库跑路 / 转生
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        销毁当前资产与库存，换取更高的全局收益倍率。
      </p>

      <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950/80 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
            current
          </span>
          <span className="font-mono text-sm text-slate-300">
            {formatMultiplier(prestigeMultiplier)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
            next
          </span>
          <span className="font-mono text-sm text-amber-300">
            {formatMultiplier(nextPrestigeMultiplier)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
            gain
          </span>
          <span className="font-mono text-sm text-emerald-300">
            +{formatMultiplier(prestigeGain)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        onMouseLeave={() => setIsConfirming(false)}
        className={`mt-4 w-full rounded-2xl border px-4 py-4 font-mono text-sm uppercase tracking-[0.28em] transition ${
          isConfirming
            ? 'border-red-400/50 bg-red-500/15 text-red-200 shadow-[0_0_24px_rgba(248,113,113,0.18)] hover:bg-red-500/20'
            : 'border-amber-300/30 bg-amber-400/10 text-amber-100 hover:border-amber-200/55 hover:bg-amber-400/15'
        }`}
      >
        {isConfirming ? '确定要销毁一切吗？再次点击确认' : '删库跑路（转生）'}
      </button>

      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">
        {isConfirming
          ? 'confirmation window armed for 4 seconds'
          : `expected multiplier: ${formatMultiplier(nextPrestigeMultiplier)}`}
      </p>
    </section>
  );
}
