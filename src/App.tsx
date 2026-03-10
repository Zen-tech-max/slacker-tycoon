import { useEffect } from 'react';

import ClickArea from './components/ClickArea';
import OfflineModal from './components/OfflineModal';
import RandomBug from './components/RandomBug';
import Shop from './components/Shop';
import useGameStore from './store/gameStore';

export default function App() {
  /**
   * 根组件只订阅 tick 方法。
   * 这样每秒自动产出变化时，不会因为订阅了整个 store 而导致 App 本身频繁重渲染。
   */
  const tick = useGameStore((state) => state.tick);

  useEffect(() => {
    useGameStore.getState().initOfflineEarnings();
  }, []);

  useEffect(() => {
    /**
     * 全局时间引擎：
     * 每 1000 毫秒推进一次游戏时间，用于结算自动产出。
     */
    const intervalId = window.setInterval(() => {
      tick();
    }, 1000);

    /**
     * 组件卸载时必须清理定时器，避免重复注册和内存泄漏。
     */
    return () => {
      window.clearInterval(intervalId);
    };
  }, [tick]);

  return (
    <main className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      <OfflineModal />
      <RandomBug />

      <div className="flex h-full flex-col lg:flex-row">
        <section className="min-h-0 flex-[2]">
          <ClickArea />
        </section>

        <section className="min-h-0 flex-1 border-t border-emerald-500/10 lg:border-l lg:border-t-0">
          <Shop />
        </section>
      </div>
    </main>
  );
}
