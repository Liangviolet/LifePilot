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

Examples:

- Prioritize high-value work in the morning
- Reserve evenings for exercise or light routines
- Gently surface delayed items before they pile up

### 2. Smart Expense Tracking

Track daily spending and generate practical saving suggestions.

Examples:

- Spot delivery spending that is trending too high
- Detect categories with repeated growth
- Offer realistic opportunities to reduce small daily costs

### 3. Mood Analysis and Guidance

Analyze user messages with lightweight mood detection and return gentle, non-medical guidance.

Examples:

- Recommend reducing low-priority tasks when stress is elevated
- Suggest rest, movement, or reaching out when energy is low

### 4. Local Lifestyle Recommendations

Future versions will combine location, time, budget, and preferences to recommend what to eat, where to go, and what to do nearby.

Examples:

- What to eat
- Where to unwind
- How to spend a weekend well

## Current Implementation

The repository now includes a locally runnable MVP API with:

- User profile management
- Task creation and task planning
- Expense logging and spending insights
- Mood analysis and response suggestions
- A dashboard-style aggregation endpoint
- SQLite-based local persistence

## Quick Start

```bash
npm install
npm run dev
```

Default address:

```bash
http://localhost:3000
```

Health check:

```bash
GET /health
```

## Current API

```bash
GET    /api/users/:userId
POST   /api/users
POST   /api/tasks
GET    /api/tasks/:userId/plan
POST   /api/expenses
GET    /api/expenses/:userId/summary
POST   /api/moods/analyze
GET    /api/dashboard/:userId
```

Bundled demo user:

```bash
demo-user
```

You can call:

```bash
GET /api/dashboard/demo-user
```

## Next Steps

- Add a proper frontend client
- Upgrade the suggestion engine from rules to model-backed generation
- Expand the recommendation layer for local lifestyle use cases
- Introduce richer user feedback and personalization loops
