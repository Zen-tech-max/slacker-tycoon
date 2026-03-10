import { useEffect, useRef, useState } from 'react';

import useGameStore from '../store/gameStore';

/**
 * 漂浮数字只属于瞬时视觉状态，不进入全局 store。
 * x、y 坐标以按钮容器左上角为基准，便于绝对定位。
 */
interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: number;
  isLeaving: boolean;
}

/**
 * 简单数值格式化：
 * 1. 早期数值直接展示完整整数，反馈更直接
 * 2. 中后期大数转成 K / M / B，避免 HUD 挤压布局
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

const FLOATING_TEXT_LIFETIME = 850;

export default function ClickArea() {
  const currentLOC = useGameStore((state) => state.currentLOC);
  const autoLOCPerSecond = useGameStore((state) => state.autoLOCPerSecond);
  const clickPower = useGameStore((state) => state.clickPower);
  const click = useGameStore((state) => state.click);

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const nextFloatingIdRef = useRef(0);
  const timeoutIdsRef = useRef<number[]>([]);

  /**
   * 组件卸载时清理定时器，避免离开页面后仍尝试 setState。
   */
  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - buttonRect.left;
    const y = event.clientY - buttonRect.top;
    const id = nextFloatingIdRef.current++;

    click();

    setFloatingTexts((prev) => [
      ...prev,
      {
        id,
        x,
        y,
        value: clickPower,
        isLeaving: false,
      },
    ]);

    /**
     * 下一帧再切换到离场状态，让浏览器能正确触发 transition。
     */
    const activateTimer = window.setTimeout(() => {
      setFloatingTexts((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                isLeaving: true,
              }
            : item,
        ),
      );
    }, 16);

    const removeTimer = window.setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, FLOATING_TEXT_LIFETIME);

    timeoutIdsRef.current.push(activateTimer, removeTimer);
  };

  return (
    <section className="relative flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden bg-slate-950 px-6 py-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_40%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_30%)]" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-8">
        <header className="w-full rounded-2xl border border-emerald-500/20 bg-slate-900/80 px-6 py-4 shadow-[0_0_40px_rgba(16,185,129,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-400/80">
                Current LOC
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold text-emerald-300 md:text-4xl">
                {formatLOC(currentLOC)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-400/70">
                Auto / Sec
              </p>
              <p className="mt-2 font-mono text-xl text-emerald-200 md:text-2xl">
                +{formatLOC(autoLOCPerSecond)}
              </p>
            </div>
          </div>
        </header>

        <div className="relative">
          <div className="pointer-events-none absolute inset-[-18%] rounded-full bg-emerald-500/10 blur-3xl" />

          <button
            type="button"
            onClick={handleClick}
            className="group relative flex h-80 w-80 select-none items-center justify-center overflow-hidden rounded-[2rem] border border-emerald-400/30 bg-slate-900/90 shadow-[0_0_60px_rgba(16,185,129,0.16)] transition duration-150 hover:border-emerald-300/60 hover:shadow-[0_0_90px_rgba(16,185,129,0.24)] active:scale-[0.98] active:shadow-[0_0_30px_rgba(16,185,129,0.2)] md:h-[24rem] md:w-[24rem]"
            aria-label="点击生成代码行数"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),transparent_45%,rgba(34,197,94,0.08))]" />
            <div className="pointer-events-none absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-5 grid grid-cols-4 gap-2 rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-4 shadow-inner shadow-emerald-500/10">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-4 w-10 rounded-md border border-emerald-400/15 bg-slate-800/90 transition duration-150 group-hover:border-emerald-300/30 group-hover:bg-slate-700/90"
                  />
                ))}
              </div>

              <p className="font-mono text-lg uppercase tracking-[0.45em] text-emerald-300">
                Terminal
              </p>
              <p className="mt-3 max-w-[15rem] text-center text-sm leading-6 text-slate-400">
                点击终端，压榨更多代码行数。
              </p>
            </div>

            {floatingTexts.map((item) => (
              <span
                key={item.id}
                className="pointer-events-none absolute font-mono text-xl font-bold text-emerald-300 drop-shadow-[0_0_12px_rgba(74,222,128,0.7)] transition-all duration-700 ease-out"
                style={{
                  left: item.x,
                  top: item.y,
                  opacity: item.isLeaving ? 0 : 1,
                  transform: item.isLeaving
                    ? 'translate(-50%, -56px) scale(1.08)'
                    : 'translate(-50%, -18px) scale(0.96)',
                }}
              >
                +{item.value}
              </span>
            ))}
          </button>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-500">
          click power: +{clickPower} loc
        </p>
      </div>
    </section>
  );
}
