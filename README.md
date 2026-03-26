# LifePilot

LifePilot is an AI assistant for everyday personal life scenarios. Its goal is not just to chat, but to help users make better day-to-day decisions with less friction.

For Simplified Chinese documentation, see [README.zh-CN.md](./README.zh-CN.md).

It focuses on a few high-frequency questions:

- What should I do first today?
- Is my recent spending reasonable?
- How should I respond to my current mood?
- How can I make daily life feel more organized and lighter?

## Product Direction

LifePilot is designed to be closer to real life than a generic chat assistant.

Compared with a general-purpose conversational AI, LifePilot emphasizes:

- Suggestions shaped by personal habits and daily inputs
- Action-oriented next steps instead of broad answers
- A growing personal assistance layer that becomes more useful over time

## Core Features

### 1. Daily Task Planning

Generate better daily plans from tasks, habits, and personal rhythm.

### 2. Smart Expense Tracking

Track daily spending and generate practical saving suggestions.

### 3. Mood Analysis and Guidance

Analyze user messages with lightweight mood detection and return gentle, non-medical guidance.

### 4. Local Lifestyle Recommendations

The current MVP now includes a local recommendation module that can either:

- Use built-in rule-based suggestions
- Fetch real POI suggestions through Amap Web Service when configured

## Current Implementation

The repository now includes:

- A Node.js + TypeScript API
- SQLite-based local persistence
- A browser UI served directly by Express
- Editable user profile settings
- A provider-based AI layer with deterministic fallback
- A local recommendation module with POI provider fallback
- Task planning, expense tracking, mood check-ins, and dashboard aggregation

## AI Layer

LifePilot routes decision logic through a provider-based AI service layer.

Supported provider modes:

- `rules`
- `openai-compatible`
- `ollama`

### Environment Variables

```bash
LIFEPILOT_AI_PROVIDER=rules
LIFEPILOT_AI_MODEL=
LIFEPILOT_AI_BASE_URL=
LIFEPILOT_AI_API_KEY=
LIFEPILOT_OLLAMA_MODEL=
```

## POI Layer

LifePilot also routes local recommendations through a POI provider layer.

Supported provider modes:

- `rules`
- `amap`

### Environment Variables

```bash
LIFEPILOT_POI_PROVIDER=rules
LIFEPILOT_AMAP_API_KEY=
LIFEPILOT_AMAP_BASE_URL=https://restapi.amap.com
```

### Example: Amap POI Provider

```bash
LIFEPILOT_POI_PROVIDER=amap
LIFEPILOT_AMAP_API_KEY=your_amap_web_service_key
LIFEPILOT_AMAP_BASE_URL=https://restapi.amap.com
```

If the Amap provider is not configured or the request fails, LifePilot falls back to built-in local recommendation rules.

## Quick Start

```bash
npm install
npm run dev
```

Default address:

```bash
http://localhost:3000
```

Open the web app in your browser and use the bundled demo user experience.

## Current API

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

Bundled demo user:

```bash
demo-user
```

You can call:

```bash
GET /api/dashboard/demo-user
GET /api/recommendations/demo-user
GET /api/ai/status
GET /api/poi/status
```

## Next Steps

- Add onboarding and multiple user flows
- Connect real POI/map data with richer filtering and coordinates
- Add more provider adapters and safer structured output validation
- Introduce richer user feedback and personalization loops
