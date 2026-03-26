# LifePilot

[English README](./README.md)

LifePilot（生活副驾驶）是一个面向个人生活场景的 AI 助手应用，目标不是只做聊天，而是帮助用户更快做出日常决策。

它关注几类高频生活问题：

- 今天先做什么
- 最近消费是否合理
- 当前情绪怎么调整
- 吃什么、去哪儿、怎么安排更轻松

## 核心能力

- 每日任务规划
- 智能记账与消费建议
- 情绪分析与建议
- 本地生活推荐
- 首页聚合式生活建议

## 当前实现

当前仓库已经提供一个可本地运行的 MVP，包含：

- Node.js + TypeScript API
- SQLite 本地持久化
- 由 Express 直接托管的 Web 页面
- 可编辑的用户档案设置
- 多模型兼容的 AI provider 层
- 可切换的本地推荐 / POI provider 层
- 任务规划、记账、情绪分析、推荐和 dashboard 聚合

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 创建本地环境变量文件

```bash
copy .env.example .env
```

3. 启动项目

```bash
npm run dev
```

默认地址：

```bash
http://localhost:3000
```

## AI Provider 层

当前支持：

- `rules`
- `openai-compatible`
- `ollama`

示例环境变量：

```bash
LIFEPILOT_AI_PROVIDER=rules
LIFEPILOT_AI_MODEL=
LIFEPILOT_AI_BASE_URL=
LIFEPILOT_AI_API_KEY=
LIFEPILOT_OLLAMA_MODEL=
```

如果你要接 OpenAI 兼容接口，可以这样配置：

```bash
LIFEPILOT_AI_PROVIDER=openai-compatible
LIFEPILOT_AI_BASE_URL=https://api.openai.com/v1
LIFEPILOT_AI_MODEL=gpt-4o-mini
LIFEPILOT_AI_API_KEY=your_api_key
```

## POI Provider 层

当前支持：

- `rules`
- `amap`

示例环境变量：

```bash
LIFEPILOT_POI_PROVIDER=rules
LIFEPILOT_AMAP_API_KEY=
LIFEPILOT_AMAP_BASE_URL=https://restapi.amap.com
```

如果你要启用高德真实地点推荐，可以这样配置：

```bash
LIFEPILOT_POI_PROVIDER=amap
LIFEPILOT_AMAP_API_KEY=你的高德 Web Service Key
LIFEPILOT_AMAP_BASE_URL=https://restapi.amap.com
```

如果高德 provider 没配置成功，系统会自动回退到本地规则推荐。

## 当前接口

```bash
GET    /health
GET    /api/ai/status
GET    /api/poi/status
GET    /api/users/:userId
POST   /api/users
PUT    /api/users/:userId
POST   /api/tasks
GET    /api/tasks/:userId/plan
POST   /api/expenses
GET    /api/expenses/:userId/summary
POST   /api/moods/analyze
GET    /api/recommendations/:userId
GET    /api/dashboard/:userId
```

内置演示用户：

```bash
demo-user
```

## 说明

- 公开仓库以产品实现和使用说明为主
- 内部方案文档不随公开仓库同步
- 前端页面现在会直接提示 AI provider 和 POI provider 是否已配置
- 后续可以继续接入更真实的地图、坐标和筛选能力
