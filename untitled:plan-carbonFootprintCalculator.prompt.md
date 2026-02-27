**Plan: 碳足迹计算器小程序**

TL;DR — 构建一款支持微信小程序首发、PWA/Web 扩展的互动式个人碳足迹计算器与“碳账本”。核心功能：活动化账单输入（交通/饮食/用电/购物等）、可复现的因子计算引擎、时序与故事化可视化（树木生长 + 一带一路路线隐喻）、渐进式精度、挑战与虚拟徽章体系。后端提供因子版本、账本同步与隐私合规支持；优先覆盖中国与东南亚国家；首阶段激励以虚拟徽章为主。

**Steps**
1. 初始化项目结构与技术栈  
- 建议：前端使用 Taro（React 生态）或 uni-app（Vue 生态）以同时产出微信小程序 + Web。后端 Node.js + PostgreSQL（或 Supabase）。  
- 创建基础仓库布局： [frontend/](frontend/) 、 [backend/](backend/) 、 [shared/](shared/) 、 [data/](data/) 、 [ci/](ci/)

2. 设计数据模型与因子版本管理  
- 定义核心 schema：`Factor`（id, category, unit, value_gCO2e, source, version, region, effective_date）、`Activity`（user_id, type, amount, unit, factor_id, scope, timestamp）与`LedgerEntry`。放在 [shared/src/models/](shared/src/models/)。  
- 实现因子服务接口（read-only + admin update）： [backend/src/controllers/factors.ts](backend/src/controllers/factors.ts)

3. 因子采集与导入管道  
- 编写导入脚本：DEFRA CSV、Poore 食品表、ElectricityMap/OurWorldInData 时序电力强度。脚本位置： [data/ingest/defra_ingest.js](data/ingest/defra_ingest.js) 、 [data/ingest/poore_ingest.py](data/ingest/poore_ingest.py)  
- 将因子写入后端 DB，并保留版本历史以便可追溯重算。

4. 实现计算引擎（核心算法）  
- 在 [shared/src/calculator.ts](shared/src/calculator.ts) 实现：activity → CO2e 核心公式、时序电力处理、航班 RFI 可选项、支出型消费两阶段（类别映射或花费乘数）。  
- 提供单元测试覆盖不同情景（transport, electricity, diet, purchases）。

5. 后端 API 与同步机制  
- 用户与认证：WeChat 登录 + Email/Guest（[backend/src/controllers/auth.ts](backend/src/controllers/auth.ts)）。  
- 账本接口：新增/更新/查询/导出 CSV（[backend/src/controllers/ledger.ts](backend/src/controllers/ledger.ts)）。  
- 同步接口与冲突策略（时间戳优先/merge）：[backend/src/services/sync.ts](backend/src/services/sync.ts)

6. 前端核心页面与组件（首发微信小程序 + PWA）  
- 页面清单（路径为建议）：  
  - 登录/简介页： [frontend/src/pages/Auth.jsx](frontend/src/pages/Auth.jsx)  
  - 个人资料/区域设置： [frontend/src/pages/Profile.jsx](frontend/src/pages/Profile.jsx)  
  - 快速输入 / 模板（出行、用电、饮食、购物）： [frontend/src/pages/InputLedger.jsx](frontend/src/pages/InputLedger.jsx)  
  - 仪表盘（总览 + 时序）： [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)  
  - 可视化组件：树木生长 `TreeViz`、冰面/海平面 `IceViz`、一带一路路线 `RouteViz`（[frontend/src/components/TreeViz.jsx](frontend/src/components/TreeViz.jsx) 等）  
  - 徽章与挑战页： [frontend/src/pages/Challenges.jsx](frontend/src/pages/Challenges.jsx)  
  - 设置（GWP 选择、隐私、导出）： [frontend/src/pages/Settings.jsx](frontend/src/pages/Settings.jsx)

7. 可视化设计与实现细则  
- 采用组合展示：左侧/顶部为精确账本与时间线，中央为情感化可视化（树木随累计减少/增长、或基于用户当期足迹冰面缩减）；同时提供地图视图展示“一带一路”路线影响。实现技术：ECharts（或 D3） + Canvas/SVG 组件（[frontend/src/components/RouteViz.jsx](frontend/src/components/RouteViz.jsx)）。  
- 动态联动规则：新账本条目 → 触发局部动画 + 总量重绘 → 若达成挑战则弹出徽章卡片。

8. 徽章与挑战系统设计  
- 后端存储徽章规则与用户达成状态： [backend/data/badges.json](backend/data/badges.json) 、引擎 [backend/src/services/badges.ts](backend/src/services/badges.ts)  
- 徽章类型：首次录入、7天减排、低碳通勤里程、区域特色徽章（熊猫、象、猎鹰等），并支持 Open Badges 导出。  
- 可配置挑战模板供产品运营下发与 A/B 测试。

9. 离线优先与同步策略  
- 前端使用本地存储/SQLite（视平台）存放未同步 ledger，队列机制重试；冲突按时间戳或用户确认解决（[frontend/src/services/offlineQueue.ts](frontend/src/services/offlineQueue.ts)）。

10. 国际化、单位与合规（首发覆盖中 + 东南亚）  
- i18n 文件： [frontend/locales/zh-CN.json](frontend/locales/zh-CN.json) 、[frontend/locales/en.json](frontend/locales/en.json) 、按需扩展。支持 RTL。  
- 单位切换（km/mi，kWh/local energy units）与国家级电力强度。  
- 隐私合规页与数据处理记录（[frontend/src/pages/Privacy.jsx](frontend/src/pages/Privacy.jsx)），后端实现数据导出/删除接口。

11. 测试、CI 与部署  
- 单元测试：calculator、badge rules、sync。端到端：登录→新增条目→同步→达成徽章。CI 配置： [ci/github-actions.yml](ci/github-actions.yml) 。  
- 部署：后端可在 Tencent/Aliyun（中国）或 AWS（国际）部署；前端通过小程序发布流程与静态站点托管。

12. 运营与后续迭代  
- 团队可迭代：增加 partner rewards、更多国家因子、离线因子包、可选碳补偿市场接入（合规评估先行）。

**Verification**
- 本地启动（示例）：
```bash
# backend
cd backend
pnpm install
pnpm dev

# frontend (Taro/uni-app)
cd frontend
pnpm install
pnpm dev:weapp   # 微信小程序开发者工具
pnpm dev:web     # 本地 PWA
```
- 运行单元测试：
```bash
pnpm test:unit
pnpm test:e2e
```
- 验证用例：创建用户 → 添加 10 km 自驾/1 kWh 用电/素食一餐 → 确认 `shared/src/calculator.ts` 输出与预期 gCO2e（与 DEFRA/Poore 对齐）；导出 CSV 并复算因子升级后的重算一致性。

**Decisions (已对齐)**
- 平台：首发微信小程序，兼顾 PWA/Web（用户确认）。  
- 覆盖地区：首发覆盖中国 + 东南亚（越南、泰国、印尼）。  
- 精度策略：采用渐进式输入，默认简洁模板，提供进阶模式以提高精度。  
- 激励方式：首阶段仅虚拟徽章与社交分享，后续可对接商家奖励或合规的碳补偿。  
- 因子基准：默认使用 DEFRA + Poore + ElectricityMap（国家/时序优先），GWP 默认 AR5 (100y)。

如需我把该草案转换为可直接执行的任务清单（每项对应 code/file patch），或立即生成项目脚手架与样例实现（包含计算引擎单元测试与样例数据导入脚本），请确认要我先做哪一项：1) 生成完整仓库 scaffold；2) 实现并测试 `shared/src/calculator.ts` 与对应单元测试；3) 先做前端 Dashboard 原型（TreeViz + 时间轴）。
