import Prestige from './Prestige';
import useGameStore from '../store/gameStore';

/**
 * 商店展示层按“基础价格 * 膨胀系数^拥有数量”实时计算价格，
 * 这样列表展示始终由当前状态推导出来，不依赖额外缓存字段。
 */
const getDynamicPrice = (basePrice: number, priceMultiplier: number, owned: number): number => {
  return Math.ceil(basePrice * Math.pow(priceMultiplier, owned));
};

/**
 * 数值展示简化：
 * 1. 小数字直接展示，便于玩家判断前期购买节奏
 * 2. 大数字缩写，避免商店卡片被金额撑坏
 */
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

export default function Shop() {
  const currentLOC = useGameStore((state) => state.currentLOC);
  const upgrades = useGameStore((state) => state.upgrades);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-slate-950/95 text-slate-100">
      <div className="border-b border-emerald-500/10 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.32em] text-emerald-400/70">Black Market</p>
        <h2 className="mt-2 font-mono text-2xl font-semibold text-emerald-300">Upgrade Shop</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          用 LOC 购买产能，把摸鱼自动化。
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {upgrades.map((upgrade) => {
            const dynamicPrice = getDynamicPrice(
              upgrade.basePrice,
              upgrade.priceMultiplier,
              upgrade.owned,
            );
            const canAfford = currentLOC >= dynamicPrice;
            const clickGain = upgrade.effect.clickPower ?? 0;
            const autoGain = upgrade.effect.autoLOCPerSecond ?? 0;

            return (
              <button
                key={upgrade.id}
                type="button"
                disabled={!canAfford}
                onClick={() => buyUpgrade(upgrade.id)}
                className={`group rounded-2xl border px-4 py-4 text-left transition duration-150 ${
                  canAfford
                    ? 'border-emerald-400/25 bg-slate-900/80 hover:-translate-y-0.5 hover:border-emerald-300/50 hover:bg-slate-900 hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]'
                    : 'cursor-not-allowed border-slate-800 bg-slate-900/45 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-mono text-base font-semibold text-slate-100">
                        {upgrade.name}
                      </h3>
                      <span className="rounded-full border border-emerald-500/15 bg-slate-950/80 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        x{upgrade.owned}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-400">{upgrade.description}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Cost</p>
                    <p
                      className={`mt-1 font-mono text-lg font-semibold ${
                        canAfford ? 'text-emerald-300' : 'text-rose-400'
                      }`}
                    >
                      {formatLOC(dynamicPrice)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/5 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {clickGain > 0 && (
                      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-2.5 py-1 font-mono text-xs text-cyan-300">
                        Click +{clickGain}
                      </span>
                    )}

                    {autoGain > 0 && (
                      <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-1 font-mono text-xs text-emerald-300">
                        Auto +{autoGain}/s
                      </span>
                    )}
                  </div>

                  <span
                    className={`font-mono text-xs uppercase tracking-[0.28em] transition ${
                      canAfford
                        ? 'text-emerald-400/80 group-hover:text-emerald-300'
                        : 'text-rose-400/80'
                    }`}
                  >
                    {canAfford ? 'deploy' : 'locked'}
                  </span>
                </div>
              </button>
            );
          })}

          <Prestige />
        </div>
      </div>
    </aside>
  );
}
