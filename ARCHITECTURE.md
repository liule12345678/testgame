# 大战略手机游戏 — 架构设计文档

> 引擎：Cocos Creator 3.8.x · 语言：TypeScript · 平台：Android（后续可扩展 iOS/Web）

---

## 1. 项目定位

- **类型**：回合制大战略（Grand Strategy）手机游戏
- **核心玩法**：多势力争夺领土、资源管理、外交、回合制决策
- **开发方式**：AI 驱动开发，GitHub Actions 自动编译，**本地不部署、不测试**

## 2. 技术选型

| 层 | 技术 | 说明 |
|---|---|---|
| 引擎 | Cocos Creator 3.8.x | 官方支持命令行构建 APK，适配 CI |
| 语言 | TypeScript（全栈） | AI 生成代码最可靠的语言 |
| 核心逻辑 | 纯 TS 独立包（零引擎依赖） | 可用 vitest 在 CI 中直接单测 |
| UI/渲染 | Cocos Creator 场景系统 | 仅做展示层 |
| 存档 | JSON 序列化 + 本地存储 | 回合制天然适合存档 |
| CI/CD | GitHub Actions | PR 跑测试 + 推送构建 APK Artifact |
| 包管理 | npm workspaces | core 与客户端共享依赖 |

## 3. 目录结构

```
testgame/
├── ARCHITECTURE.md            # 本文档
├── package.json               # npm workspaces 根配置
├── tsconfig.base.json         # 共享 TS 配置
├── .github/
│   └── workflows/
│       ├── ci.yml             # PR：类型检查 + 单元测试
│       └── build-android.yml  # push main：构建 APK → Artifact
├── packages/
│   ├── core/                  # ★ 纯 TS 战略核心（无引擎依赖）
│   │   ├── src/
│   │   │   ├── map/           # 地图：六边形格子、省份、地形
│   │   │   ├── faction/       # 势力：资源、收入、科技树
│   │   │   ├── unit/          # 部队：编制、移动、战斗
│   │   │   ├── ai/            # 势力 AI：评估、决策、行动
│   │   │   ├── economy/       # 经济：税收、建设、贸易
│   │   │   ├── diplomacy/     # 外交：宣战、结盟、条约
│   │   │   ├── turn/          # 回合调度器（核心状态机）
│   │   │   └── events/        # 随机/脚本事件系统
│   │   └── tests/             # vitest 单元测试（CI 必须全绿）
│   └── client/                # Cocos Creator 工程（assets/ 内）
│       └── assets/
│           ├── scenes/        # 主菜单 / 战略地图 / 战斗 / 内政
│           ├── scripts/       # 视图层脚本，只调用 @game/core
│           └── resources/     # 美术、音频、配置表
└── docs/                      # 设计文档、数值策划案
```

## 4. 核心架构原则

### 4.1 逻辑与渲染严格分离（最重要）

```
┌─────────────────────────────────────┐
│  client (Cocos Creator 视图层)        │
│  只做：渲染 / 输入 / 动画 / 音效       │
│         │  调用命令      ▲ 订阅状态    │
│         ▼               │            │
│  ┌─────────────────────────────────┐ │
│  │  core (纯 TS 战略核心)           │ │
│  │  GameState → 纯数据（可序列化）    │ │
│  │  Command   → 所有变更必须经命令   │ │
│  │  Event     → 变更后广播事件       │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**规则：**

1. `core` 不 import 任何 `cc`（引擎）模块，CI 用脚本强制检查
2. 一切状态变更通过 **Command（命令）** 进行：`moveUnit`、`declareWar`、`endTurn`…可校验、可回放、可存档
3. 视图层只读取 GameState 快照 + 订阅事件，不直接改数据
4. `GameState` 必须可完整 JSON 序列化 → 存档 = 一次 `JSON.stringify`

### 4.2 回合制主循环（TurnScheduler）

```
玩家回合（下命令）
   ↓
endTurn() → 结算玩家收入/建设
   ↓
依次执行每个 AI 势力（ai/ 评估 → 生成命令 → 执行）
   ↓
全局结算（人口增长、事件触发、外交冷却）
   ↓
回合数 +1 → 交还玩家
```

### 4.3 势力 AI 分层

| 层 | 职责 |
|---|---|
| 评估层 Evaluation | 给每个省份/目标打分（威胁、价值、可攻性） |
| 战略层 Strategy | 决定大方向：扩张/防守/发展，按势力性格加权 |
| 战术层 Tactics | 具体命令：部队调派、攻击目标选择 |
| 外交层 Diplomacy | 评估关系值，决定结盟/宣战/贸易 |

AI 全部在 `core/ai/` 中实现，确定性优先（种子随机），便于 CI 测试复现。

### 4.4 地图设计

- **六边形网格（Hex Grid）**，轴坐标系（axial coordinates）
- 地图上层结构：`世界 → 区域(Region) → 省份(Province) → 格子(Tile)`
- 大战略以**省份为最小策略单位**，格子仅用于部队移动与战斗

## 5. 数据流示例（一次攻击）

```
玩家点击敌省 → client 发送 AttackCommand
  → core 校验合法性（兵力/地形/外交状态）
  → 失败：返回错误事件 → client 弹提示
  → 成功：战斗解算 → 修改 GameState → 广播 BattleResultEvent
  → client 监听事件 → 播放战斗动画/更新地图颜色
```

## 6. CI/CD 流水线（GitHub Actions）

### ci.yml（每次 PR / push）

1. `npm ci` 安装依赖
2. `tsc --noEmit` 类型检查（core + client 脚本）
3. `vitest run` 跑 core 单元测试
4. 检查 `core` 未引入引擎依赖
5. 全绿才允许合并

### build-android.yml（push 到 main）

1. 使用 Cocos Creator 官方 Docker 镜像执行命令行构建
2. 构建 Android APK（Gradle + Android SDK 容器）
3. 上传 APK 到 Actions Artifact，手机直接下载安装
4. 可选：打 tag 时自动创建 GitHub Release

> **本地无需安装任何引擎/SDK** —— 全部构建发生在 GitHub 云端。

## 7. 里程碑路线图

| 阶段 | 内容 | 验收标准 |
|---|---|---|
| M0 | 项目骨架 + CI 流水线 | PR 自动测试，main 自动出 APK |
| M1 | 地图 + 回合调度 | 可在六边形地图上移动部队、结束回合 |
| M2 | 经济系统 | 省份产出资源、征税、建设 |
| M3 | 战斗系统 | 部队交战、占领省份 |
| M4 | 势力 AI | 电脑势力能扩张/防守/宣战 |
| M5 | 外交 + 事件 | 结盟、贸易、随机事件 |
| M6 | 平衡与打磨 | 数值调整、教程、存档/读档 |

## 8. 开发约定（面向 AI 协作）

- 每个功能一个分支 + PR，PR 描述写明改动了哪个模块
- `core` 内每个系统必须有对应 `tests/*.test.ts`，先写测试再实现
- 数值配置（税率、兵种属性）放 `packages/client/assets/resources/data/*.json`，代码不改死值
- 所有随机数使用种子随机（`core/rng`），保证回放与测试一致
