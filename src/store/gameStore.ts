import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 单个资产的产出效果定义。
 * clickPower 表示“每次点击额外增加多少 LOC”。
 * autoLOCPerSecond 表示“每秒额外自动增加多少 LOC”。
 */
export interface UpgradeEffect {
  clickPower?: number;
  autoLOCPerSecond?: number;
}

/**
 * 商店中单个可购买资产的数据结构。
 */
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  owned: number;
  priceMultiplier: number;
  effect: UpgradeEffect;
}

/**
 * 随机 Bug 事件的数据结构。
 * 坐标使用百分比，便于 UI 直接做绝对定位。
 */
export interface ActiveBug {
  x: number;
  y: number;
  reward: number;
}

/**
 * 整个游戏状态切片。
 * 这里集中维护放置游戏的核心数值状态、离线收益状态、随机事件状态和核心行为方法。
 */
export interface GameStoreState {
  /**
   * 玩家当前手里可消费的 LOC（代码行数）。
   */
  currentLOC: number;

  /**
   * 历史累计获得过的 LOC。
   * 这是“生涯总产出”，消费不会减少它。
   */
  lifetimeLOC: number;

  /**
   * 当前每次点击的基础 LOC。
   * 实际点击收益 = clickPower * prestigeMultiplier。
   */
  clickPower: number;

  /**
   * 当前每秒自动获得的基础 LOC。
   * 实际自动收益 = autoLOCPerSecond * prestigeMultiplier。
   */
  autoLOCPerSecond: number;

  /**
   * 转生倍率。
   * 初始值为 1，所有点击和自动产出都必须乘上该倍率。
   */
  prestigeMultiplier: number;

  /**
   * 上一次游戏处于活跃状态的时间戳。
   * 使用毫秒级 Unix 时间，方便与 Date.now() 直接计算。
   */
  lastActiveTime: number;

  /**
   * 本次离线结算所得，用于给 UI 层弹窗展示。
   * 没有离线收益时为 null，避免 UI 误弹空提示。
   */
  offlineEarningsReport: number | null;

  /**
   * 当前活跃的随机 Bug。
   * 若为 null，表示当前场上没有 Bug。
   */
  activeBug: ActiveBug | null;

  /**
   * 商店资产列表。
   */
  upgrades: Upgrade[];

  /**
   * 点击中央键盘时触发。
   * 默认点击 1 次，也支持未来扩展为批量点击。
   */
  click: (times?: number) => void;

  /**
   * 购买指定 ID 的资产。
   */
  buyUpgrade: (upgradeId: string) => void;

  /**
   * 放置游戏的“时间推进”动作。
   * 每次心跳除了增加自动产出，也会更新 lastActiveTime，
   * 并以 5% 概率生成一个随机 Bug（若当前没有 Bug）。
   */
  tick: (deltaSeconds?: number) => void;

  /**
   * 游戏初始化时执行一次离线收益结算。
   */
  initOfflineEarnings: () => void;

  /**
   * 玩家关闭离线收益弹窗后调用，清空本次报告。
   */
  clearOfflineReport: () => void;

  /**
   * 点击并捕获当前 Bug。
   * 奖励为 15 秒的自动产出，并立即清除当前 Bug。
   */
  catchBug: () => void;

  /**
   * 清除当前 Bug。
   * 用于超时逃跑或其他系统级销毁逻辑。
   */
  clearBug: () => void;

  /**
   * 删库跑路 / 转生。
   * 会重置当前局内资源和资产，但保留历史总数，并更新新的转生倍率。
   */
  doPrestige: () => void;
}

const OFFLINE_REWARD_THRESHOLD_SECONDS = 60;
const BUG_SPAWN_CHANCE_PER_TICK = 0.05;

/**
 * 初始资产列表模板。
 * 用函数返回新数组，避免重置时共享同一份对象引用。
 */
const createInitialUpgrades = (): Upgrade[] => [
  {
    id: 'intern',
    name: '实习生',
    description: '会复制粘贴模板代码，稳定产出少量 LOC。',
    basePrice: 10,
    currentPrice: 10,
    owned: 0,
    priceMultiplier: 1.15,
    effect: {
      autoLOCPerSecond: 1,
    },
  },
  {
    id: 'mechanical-keyboard',
    name: '机械键盘',
    description: '更清脆的敲击感，让每次点击更值钱。',
    basePrice: 50,
    currentPrice: 50,
    owned: 0,
    priceMultiplier: 1.18,
    effect: {
      clickPower: 2,
    },
  },
  {
    id: 'dual-monitor',
    name: '双屏工位',
    description: '减少切窗口时间，提升点击与自动产能。',
    basePrice: 200,
    currentPrice: 200,
    owned: 0,
    priceMultiplier: 1.2,
    effect: {
      clickPower: 3,
      autoLOCPerSecond: 4,
    },
  },
  {
    id: 'code-generator-ai',
    name: 'AI 助手',
    description: '开始自动补全和批量生成样板代码。',
    basePrice: 750,
    currentPrice: 750,
    owned: 0,
    priceMultiplier: 1.22,
    effect: {
      autoLOCPerSecond: 15,
    },
  },
  {
    id: 'outsourcing-team',
    name: '外包小队',
    description: '把重复劳动打包出去，自动产出明显提升。',
    basePrice: 2500,
    currentPrice: 2500,
    owned: 0,
    priceMultiplier: 1.25,
    effect: {
      autoLOCPerSecond: 45,
    },
  },
  {
    id: 'cto-bot',
    name: 'CTO Bot',
    description: '既能拍板架构，也能推动整条产线提速。',
    basePrice: 10000,
    currentPrice: 10000,
    owned: 0,
    priceMultiplier: 1.28,
    effect: {
      clickPower: 10,
      autoLOCPerSecond: 120,
    },
  },
];

/**
 * 统一处理价格膨胀。
 * 价格始终取整，避免出现小数货币。
 */
const getCurrentUpgradePrice = (upgrade: Upgrade): number => {
  return Math.ceil(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, upgrade.owned));
};

/**
 * 计算当前有效点击收益。
 */
const getEffectiveClickPower = (clickPower: number, prestigeMultiplier: number): number => {
  return clickPower * prestigeMultiplier;
};

/**
 * 计算当前有效自动收益。
 */
const getEffectiveAutoLOCPerSecond = (
  autoLOCPerSecond: number,
  prestigeMultiplier: number,
): number => {
  return autoLOCPerSecond * prestigeMultiplier;
};

/**
 * 基于当前产能生成一个随机 Bug。
 * 奖励固定为 15 秒自动产出。
 */
const createRandomBug = (
  autoLOCPerSecond: number,
  prestigeMultiplier: number,
): ActiveBug => {
  const reward = getEffectiveAutoLOCPerSecond(autoLOCPerSecond, prestigeMultiplier) * 15;

  return {
    x: Math.floor(Math.random() * 70) + 15,
    y: Math.floor(Math.random() * 60) + 20,
    reward,
  };
};

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      currentLOC: 0,
      lifetimeLOC: 0,
      clickPower: 1,
      autoLOCPerSecond: 0,
      prestigeMultiplier: 1,
      lastActiveTime: Date.now(),
      offlineEarningsReport: null,
      activeBug: null,
      upgrades: createInitialUpgrades(),

      click: (times = 1) => {
        if (times <= 0) {
          return;
        }

        set((state) => {
          const earnedLOC =
            getEffectiveClickPower(state.clickPower, state.prestigeMultiplier) * times;

          return {
            currentLOC: state.currentLOC + earnedLOC,
            lifetimeLOC: state.lifetimeLOC + earnedLOC,
          };
        });
      },

      buyUpgrade: (upgradeId) => {
        const { upgrades, currentLOC } = get();
        const targetUpgrade = upgrades.find((upgrade) => upgrade.id === upgradeId);

        if (!targetUpgrade) {
          return;
        }

        const currentPrice = getCurrentUpgradePrice(targetUpgrade);

        if (currentLOC < currentPrice) {
          return;
        }

        set((state) => {
          const upgradeToBuy = state.upgrades.find((upgrade) => upgrade.id === upgradeId);

          if (!upgradeToBuy) {
            return state;
          }

          const nextUpgrades = state.upgrades.map((upgrade) => {
            if (upgrade.id !== upgradeId) {
              return upgrade;
            }

            const nextOwned = upgrade.owned + 1;

            return {
              ...upgrade,
              owned: nextOwned,
              currentPrice: Math.ceil(
                upgrade.basePrice * Math.pow(upgrade.priceMultiplier, nextOwned),
              ),
            };
          });

          return {
            currentLOC: state.currentLOC - currentPrice,
            clickPower: state.clickPower + (upgradeToBuy.effect.clickPower ?? 0),
            autoLOCPerSecond:
              state.autoLOCPerSecond + (upgradeToBuy.effect.autoLOCPerSecond ?? 0),
            upgrades: nextUpgrades,
          };
        });
      },

      tick: (deltaSeconds = 1) => {
        if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
          return;
        }

        const now = Date.now();

        set((state) => {
          const autoGeneratedLOC =
            getEffectiveAutoLOCPerSecond(
              state.autoLOCPerSecond,
              state.prestigeMultiplier,
            ) * deltaSeconds;

          const shouldSpawnBug =
            state.activeBug === null && Math.random() < BUG_SPAWN_CHANCE_PER_TICK;

          return {
            currentLOC: state.currentLOC + autoGeneratedLOC,
            lifetimeLOC: state.lifetimeLOC + autoGeneratedLOC,
            lastActiveTime: now,
            activeBug: shouldSpawnBug
              ? createRandomBug(state.autoLOCPerSecond, state.prestigeMultiplier)
              : state.activeBug,
          };
        });
      },

      initOfflineEarnings: () => {
        const now = Date.now();
        const { lastActiveTime, autoLOCPerSecond, prestigeMultiplier } = get();

        if (!Number.isFinite(lastActiveTime) || lastActiveTime <= 0) {
          set({
            lastActiveTime: now,
            offlineEarningsReport: null,
          });
          return;
        }

        const offlineSeconds = Math.max(0, Math.floor((now - lastActiveTime) / 1000));

        if (offlineSeconds <= OFFLINE_REWARD_THRESHOLD_SECONDS) {
          set({
            lastActiveTime: now,
            offlineEarningsReport: null,
          });
          return;
        }

        const offlineEarnings =
          getEffectiveAutoLOCPerSecond(autoLOCPerSecond, prestigeMultiplier) * offlineSeconds;

        set((state) => ({
          currentLOC: state.currentLOC + offlineEarnings,
          lifetimeLOC: state.lifetimeLOC + offlineEarnings,
          lastActiveTime: now,
          offlineEarningsReport: offlineEarnings,
        }));
      },

      clearOfflineReport: () => {
        set({
          offlineEarningsReport: null,
        });
      },

      catchBug: () => {
        set((state) => {
          if (!state.activeBug) {
            return state;
          }

          return {
            currentLOC: state.currentLOC + state.activeBug.reward,
            lifetimeLOC: state.lifetimeLOC + state.activeBug.reward,
            activeBug: null,
          };
        });
      },

      clearBug: () => {
        set({
          activeBug: null,
        });
      },

      doPrestige: () => {
        set((state) => {
          const nextPrestigeMultiplier = 1 + Math.sqrt(state.lifetimeLOC / 100000);

          return {
            currentLOC: 0,
            clickPower: 1,
            autoLOCPerSecond: 0,
            prestigeMultiplier: nextPrestigeMultiplier,
            lastActiveTime: Date.now(),
            offlineEarningsReport: null,
            activeBug: null,
            upgrades: createInitialUpgrades(),
          };
        });
      },
    }),
    {
      name: 'slacker-tycoon-save',
    },
  ),
);

export default useGameStore;
