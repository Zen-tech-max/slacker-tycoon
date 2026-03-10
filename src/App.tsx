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
    // 🌟 修改 1：外层容器。手机端设为列排布 (flex-col) 且允许纵向滚动；
    // PC端 (md:) 恢复为行排布 (md:flex-row) 且全屏禁止整体滚动 (md:overflow-hidden)。
    // 使用 min-h-[100dvh] 完美适配手机浏览器的动态地址栏高度。
    <div className="relative flex flex-col md:flex-row w-full min-h-[100dvh] md:h-screen bg-gray-950/60 backdrop-blur-sm md:overflow-hidden font-sans text-gray-100">
      
      {/* 🌟 修改 2：左侧工作台。在手机端给它至少 55% 的屏幕高度，保证玩家有足够的地方点键盘；PC 端则占满剩余宽度 */}
      <div className="relative flex-1 min-h-[55vh] md:min-h-0">
        <ClickArea />
      </div>

      {/* 🌟 修改 3：右侧商店。手机端宽度占满 100% (w-full)，PC端固定 380px 宽。 */}
      {/* flex-shrink-0 保证商店不会被挤压 */}
      <div className="w-full md:w-[380px] md:h-full shadow-2xl relative z-10 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-800">
        <Shop />
      </div>

      {/* 全局组件挂载 */}
      <OfflineModal />
      <RandomBug />

    </div>
  );
}
