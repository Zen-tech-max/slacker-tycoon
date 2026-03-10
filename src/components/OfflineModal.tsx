import useGameStore from '../store/gameStore';

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

export default function OfflineModal() {
  const offlineEarningsReport = useGameStore((state) => state.offlineEarningsReport);
  const clearOfflineReport = useGameStore((state) => state.clearOfflineReport);

  if (offlineEarningsReport === null || offlineEarningsReport <= 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/70 px-6 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.16),_transparent_30%)]" />

      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-400/25 bg-slate-900/95 shadow-[0_0_80px_rgba(16,185,129,0.16)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,rgba(16,185,129,0.08),transparent_40%,rgba(34,197,94,0.06))]" />

        <div className="relative px-8 py-8">
          <p className="font-mono text-xs uppercase tracking-[0.38em] text-emerald-400/80">
            System Report
          </p>
          <h2 className="mt-3 font-mono text-3xl font-semibold text-emerald-300">
            Offline Earnings Detected
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            你离开工位期间，后台脚本仍在持续摸鱼产出。
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-slate-950/80 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recovered LOC</p>
            <p className="mt-3 font-mono text-4xl font-semibold text-emerald-300">
              +{formatLOC(offlineEarningsReport)}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-slate-500">
              unauthorized productivity restored
            </p>
            <button
              type="button"
              onClick={clearOfflineReport}
              className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-5 py-3 font-mono text-sm uppercase tracking-[0.28em] text-emerald-200 transition hover:border-emerald-200/60 hover:bg-emerald-400/15 hover:text-emerald-100"
            >
              confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
