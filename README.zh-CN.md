# LifePilot

[English README](./README.md)

LifePilot（生活副驾驶）是一个面向个人生活场景的 AI 助手应用，目标不是只做聊天，而是帮助用户更快做出日常决策。

## 核心能力

- 每日任务规划
- 智能记账与消费建议
- 情绪分析与建议
- 首页聚合式生活建议

## 当前实现

当前仓库已提供一个本地可运行的 MVP API，包含以下能力：

- 用户档案读写
- 任务录入与任务规划
- 支出录入与消费汇总
- 情绪分析与建议生成
- Dashboard 聚合接口
- SQLite 本地持久化

## 本地运行

```bash
npm install
npm run dev
```

默认地址：

```bash
http://localhost:3000
```

## 主要接口

```bash
GET    /health
GET    /api/users/:userId
POST   /api/users
POST   /api/tasks
GET    /api/tasks/:userId/plan
POST   /api/expenses
GET    /api/expenses/:userId/summary
POST   /api/moods/analyze
GET    /api/dashboard/:userId
```

内置演示用户：

```bash
demo-user
```

可直接访问：

```bash
GET /api/dashboard/demo-user
```

## 说明

- 公开仓库以产品实现和使用说明为主
- 内部方案文档不随公开仓库同步
- 后续将继续补充前端与更完整的 AI 能力
