# 💻 代码重构：摸鱼大亨 (Slacker Tycoon)

> 🚀 **“不要用战术上的勤奋，掩盖你没有写自动化脚本的事实。”**
>
> 这是一个基于现代 Web 技术栈构建的硬核前端放置类（Idle/Clicker）游戏。玩家将扮演一名渴望摸鱼的程序员，通过疯狂敲击键盘、招募 AI 助手、捕获野生 Bug，最终积累足以“删库跑路”的资本，实现代码资产的指数级爆炸。

---

## ✨ 核心游戏机制 (Core Features)

*   **⌨️ 核心循环 (Core Loop)：** 极度流畅的点击反馈闭环，配合基于 `requestAnimationFrame` 级别的状态更新，体验纯粹的数值暴涨快感。
*   **📈 动态物价引擎：** 采用经典的指数通胀模型 `baseCost * (costMultiplier ^ count)`，维持长线游戏生命周期。
*   **🔋 离线收益计算 (Offline Progress)：** 借助持久化存储计算时间戳差值。哪怕关闭浏览器，你的 AI 实习生依然在服务器上为你疯狂搬砖。
*   **🐛 随机事件系统 (Random Spawner)：** 高光时刻！屏幕随机生成带有真实物理跳动反馈的 Bug，考验手速，捕获即可获得巨额代码分红。
*   **☢️ 删库跑路 (Prestige System)：** 硬核的转生机制。销毁一切现有资产，换取基于 `1 + Math.sqrt(lifetimeLOC / 100000)` 公式的永久全局产出倍率飙升。防误触两段式确认，极具“产品同理心”。

---

## 🛠 技术栈架构 (Tech Stack)

本项目拒绝臃肿，追求极致的加载速度与开发体验：

*   **框架：** React 18 (严格模式)
*   **构建工具：** Vite (极速 HMR 与 Rollup 生产打包)
*   **状态管理：** Zustand (高度解耦，舍弃繁琐的 Redux，内置 `persist` 中间件实现零成本存档)
*   **样式方案：** Tailwind CSS (Utility-first，纯粹的 Dark Mode 极客终端视觉体验)
*   **部署流水线：** Vercel CI/CD (全自动热重载上线)

---

## 📦 本地开发指南 (Local Setup)

如果你想在本地接管这个自动化帝国，请确保你已安装 `Node.js (v18+)`。

```bash
# 1. 克隆仓库
git clone [https://github.com/](https://github.com/)Zen-tech-max/slacker-tycoon.git

# 2. 进入目录
cd slacker-tycoon

# 3. 安装底层依赖
npm install

# 4. 启动本地开发服务器
npm run dev