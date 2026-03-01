碳足迹计算器（项目骨架）

说明
- 首发平台：微信小程序 + PWA

## 微信小程序开发

仓库下有一个基本的 Taro 小程序项目放在 `weapp/`：

```bash
# 安装依赖后启动开发工具
npm run weapp:init      # 进入 weapp 目录并安装依赖
npm run dev:weapp       # 启动 taro 编译并开启 watch
```

在微信开发者工具中打开 `weapp/dist/weapp` 目录即可预览。

- 主要模块：frontend / backend / shared / data / ci

快速开始
1. 安装依赖（后续各目录会单独说明）
2. 运行测试：`npm test`（当前实现为 `shared` 下的简单单元测试）

当前状态
- 已创建项目脚手架和 `shared` 目录下基础计算器与测试脚本。