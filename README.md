# WorkSync Frontend

A modern, real-time project management and collaboration platform. Think Jira meets Slack, but actually enjoyable to use.

**Backend:** [workSync-backend](https://github.com/sk-pathak/workSync-backend)

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Real-time:** WebSocket (STOMP over SockJS)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Routing:** React Router v7

## Setup Instructions

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

> **Note:** For full architecture details, database setup, and API documentation, check out the [backend repository](https://github.com/sk-pathak/workSync-backend).

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Login & registration forms
│   ├── layout/         # App layout, sidebar, footer
│   ├── projects/       # Project-related components
│   ├── tasks/          # Task board & dialogs
│   └── ui/             # shadcn/ui components
├── pages/              # Route-level pages
│   ├── auth/           # Auth pages
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   └── ...
├── stores/             # Zustand state stores
├── lib/                # API client, WebSocket, utils
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## Demo

> **Coming soon!** Screenshots and demo GIF will be added here.

<!-- Add your screenshots like this:
![Dashboard](./docs/screenshots/dashboard.png)
![Project Board](./docs/screenshots/project-board.png)
![Real-time Chat](./docs/screenshots/chat.png)
-->

## License

MIT
