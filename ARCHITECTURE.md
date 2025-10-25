# WorkSync Frontend Architecture

> A comprehensive, fresher‑friendly yet in‑depth guide to the React + TypeScript architecture of this project. Use this as a full‑stop shop for ramp‑up, design discussions, and interview preparation.

---
## 1. High-Level Overview
WorkSync is a project & task collaboration frontend built with:
- **React 19 + TypeScript** (SPA via Vite)
- **React Router v7** for client-side routing
- **@tanstack/react-query v5** for server state synchronization (queries + mutations, cache invalidation)
- **Zustand** for lightweight, colocated client (UI/domain) state (auth, projects, tasks, notifications, chat)
- **Axios** for HTTP with layered interceptors + soft in-session caching
- **STOMP/WebSockets (SockJS)** for real-time chat + live updates potential
- **Radix UI + headless primitives + custom UI components + Tailwind CSS** for accessible, theme-ready design
- **Form + Validation** via `react-hook-form` + `zod` (resolvers)
- **Framer Motion** for animation
- **Date-fns** for time formatting
- **Recharts** & potential analytics components

### Core Principles
1. **Separation of state types**: Remote server cache (React Query) vs persistent auth/ephemeral UI domain state (Zustand)
2. **Progressive enhancement**: Lazy + Suspense for heavy feature bundles (Task board, Chat, Analytics, Settings)
3. **Optimistic & reactive UX**: Mutations with optimistic updates (e.g. starring projects)
4. **Side-effect isolation**: API layer centralizes error handling, token handling, ad-hoc caching, invalidation triggers
5. **Scalability & readability**: Domain-based directory (auth, projects, tasks, pages, stores, lib, components/ui)
6. **Resilience**: WebSocket reconnection logic + graceful degradation

---
## 2. Directory Structure (Functional Domains)
```
src/
  pages/           # Route-level screens (composition + data fetching orchestration)
  components/      # Reusable and domain UI widgets (tasks/, projects/, layout/, ui/)
  stores/          # Zustand state slices per domain
  lib/             # API, config, websocket, utilities, query config, error handling
  hooks/           # Custom React hooks (e.g., optimized mutations)
  types/           # Central shared TypeScript DTO / domain types
  assets/          # Static images / svgs
```

### Page vs Component
- **Pages**: orchestrate data (queries/mutations), coordinate dialogs, route params, layout composition.
- **Components**: presentational/interactive; assume they receive already-shaped props.
- **Dialogs & Panels**: Lazy loaded to reduce initial bundle.

---
## 3. State Management Strategy
| Concern | Library | Persistence | Examples |
|---------|---------|-------------|----------|
| Server cache (API data) | React Query | Memory (per session) | project details, tasks list, members |
| Auth & cross-session user | Zustand (persist middleware) | localStorage | `authStore` user + token |
| Domain collections & local derivations | Zustand | Memory | `projectStore`, `taskStore` |
| Form + validation state | react-hook-form | Ephemeral | Login/Register forms |
| UI ephemeral (dialog open, selection) | Local component state | N/A | `createTaskOpen`, `selectedTask` |
| Real-time ephemeral (chat messages) | WebSocket + (likely a store) | Memory | `chatStore` (not shown here) |

### Why split?
- React Query excels at fetching/invalidating remote resources.
- Zustand gives minimal, flexible local state without context over-rendering.
- Avoids misusing one tool for all (e.g., forcing React Query to store purely client-only UI flags).

---
## 4. Data Fetching & Caching Layer
### React Query Patterns
- **Queries**: Identified by stable keys (`['project', id]`, `['tasks', projectId]`).
- **Mutations**: Invalidate dependent queries on success (`queryClient.invalidateQueries`).
- **Optimistic Update**: Star/unstar uses `onMutate` to pre-flip UI state.
- **Stale Time**: Often immediate revalidation (staleTime: 0) for fresh project data; could be tuned per resource.

### Axios Interceptors
1. **Request**: Attaches JWT if present; adds `Cache-Control` on GET.
2. **Response**: Manual sessionStorage caching for GETs (5 min TTL) to reduce API pressure. Custom key: `cache_{url}`.
3. **401 Handling**: On token expiry triggers `logout` and redirect.

### Dual Caching (React Query + sessionStorage)
- React Query already caches; sessionStorage is an extra layer (useful across tab reloads). Trade-off: potential staleness vs faster perceived loads. Could consolidate later.

### Cache Invalidation
- Manual `clearCache(pattern)` after mutations ensures sessionStorage coherence.
- React Query invalidation ensures UI updates from server truth post-mutation.

---
## 5. Auth Flow
1. User logs in → `authApi.login` → token stored in both localStorage & persisted Zustand slice.
2. Interceptor injects token on each request.
3. On 401 TOKEN_EXPIRED → dynamic import of store → `logout()` cascade: disconnect WebSocket, purge caches/stores, redirect.
4. `persist` middleware partializes only necessary keys (security principle: least persisted surface).

### Security Considerations (Future)
- HttpOnly cookies over localStorage (mitigate XSS).
- Refresh token rotation endpoints.
- CSRF protection if moving to cookies.
- Suspicious session invalidation broadcast.

---
## 6. Real-Time Layer (WebSocket)
- STOMP over SockJS fallback ensures compatibility.
- Lazy dynamic import of `sockjs-client` inside `connect` reduces initial bundle size.
- Heartbeats + limited reconnection attempts (exponential/backoff could be future improvement).
- Topic subscription pattern: `/topic/chat/{chatId}`.
- Outbound publish endpoint: `/app/chat.send/{chatId}`.
- Basic schema normalization when receiving messages (ensures `Message` shape completeness + fallback IDs).

### Potential Enhancements
- Presence / typing indicators channels.
- Offline queue for unsent messages + optimistic chat append.
- Reusable subscription manager for multiple channels (notifications, task events).

---
## 7. UI / Styling System
- **Tailwind** + `clsx` + `tailwind-merge` via `cn` helper for deterministic class merging.
- **Radix UI primitives** wrapped into local components (Button, Dialog, Tabs, etc.) ensuring consistent theme surface.
- **Design Tokens** (implied by class naming) can be externalized for dark/light theme toggling (potential integration with `next-themes`).
- **Framer Motion**: Animations on mount transitions (e.g., page sections, cards) for perceived performance polish.

### Accessibility
- Radix primitives provide ARIA baseline.
- Ensure alt text for images, semantic headings, button labels (audit recommended).

---
## 8. Code Splitting & Performance
- **React.lazy + Suspense** around heavy/conditional sections: TaskBoard, ChatBox, AnalyticsPanel, Dialogs.
- Defers JavaScript cost until user invokes the feature (especially analytics & chat).
- **Potential**: route-level splitting via dynamic `import()` in router config.
- Prefetch strategies (on hover or viewport) could improve responsiveness.

### Performance Opportunities
- Replace dual cache with React Query persist (to IndexedDB) for consistent hydration.
- Virtualize large task lists.
- Memoize derived arrays (e.g., `projectMembers`) if expensive.
- Use `React.useTransition` for non-critical state transitions (React 18+ concurrent features).

---
## 9. Forms & Validation
- `react-hook-form` offers uncontrolled inputs performance.
- `zod` schemas (implied by resolvers) provide type-safe validation + inference.
- Patterns: central schema definitions → reuse across Register/Login + future profile forms.

---
## 10. Error Handling Strategy
- Central `ErrorHandler` (API + WebSocket). Likely shows toasts (via `sonner`).
- Graceful fallback: `ErrorBoundary` component (found under `components/ui/ErrorBoundary.tsx` if extended) should wrap major layout segments.
- Toast categories: success, error, info for user feedback.

---
## 11. Domain Walkthrough (Example: Project Detail Page)
Responsibilities:
- Retrieves project, tasks, members, starred status.
- Coordinates membership actions (join/leave), starring, task CRUD (create/edit/delete), assignment, status updates.
- Provides overview analytics, chat, members list within tabbed UI.
- Wraps heavy panels in `Suspense` fallback components.
- Applies optimistic update for star toggle and invalidates necessary queries on settle.

Key React Concepts Demonstrated:
- **Derived State**: `projectMembers` dereferenced from members API response.
- **Conditional rendering**: membership-based access control for actions.
- **Lazy/Suspense**: micro-frontends like TaskBoard.
- **Mutation side-effects**: `queryClient.invalidateQueries` ensures fresh lists.
- **State colocation**: Dialog open state lives in component (not global) because scope is local.

---
## 12. Type System
- Central `types/index.ts` defines interfaces: `User`, `Project`, `Task`, `Notification`, `Message`, `PagedResponse`, etc.
- **Advantages**: Single source of truth; consumption by stores, API layer, components → reduces drift.
- Could derive from backend OpenAPI spec in future (codegen) to prevent manual sync errors.

---
## 13. Testing Strategy (Future Recommendation)
Currently not present; suggested layers:
1. **Unit**: utils (`cn`), store reducers (simulate actions).
2. **Integration**: React Query hooks + component interactions (Testing Library + MSW mocking API).
3. **E2E**: Basic flows (login, create project, add task) using Playwright.

---
## 14. Extensibility Roadmap (Feature Ideas)
| Feature | Description | React Considerations | Trade-offs |
|---------|-------------|----------------------|-----------|
| Notifications Real-time | WebSocket subscription for live updates | Additional channel subscriptions | More open sockets; need multiplexing |
| Offline Mode | Cache tasks/projects locally for read/write queue | React Query persist + mutation queue | Complexity in conflict resolution |
| Global Search | Fuzzy search across tasks/projects | Debounced input + server or local index | Perf cost indexing large data |
| Role-Based Access Control | Fine-grained permissions UI gating | Higher-order components / hooks for `useCan()` | More branching logic |
| Theme System | Multi-theme with tokens | Context + CSS variables | Theming complexity |
| File Attachments | Upload tasks docs | Managed upload hooks, progress bars | Storage + security concerns |
| Activity Feed | Real-time audit events | Subscription aggregator, virtualization | Data volume, ordering |
| Mobile PWA | Offline-first + push | Service worker precache + query hydration | Bundle size, complexity |

---
## 15. Architectural Trade-offs Summary
| Decision | Pros | Cons | Mitigation |
|----------|------|------|-----------|
| Zustand + React Query split | Clear separation of server vs client state; performance | Two paradigms to learn | Docs + patterns section |
| Manual sessionStorage caching | Faster reloads | Duplication with React Query; staleness | Consider React Query persist plugin |
| LocalStorage token | Simple | XSS risk | Migrate to HttpOnly cookie refresh model |
| Lazy-loaded feature modules | Lower initial bundle | First-click latency | Preload on hover/idle |
| WebSocket single channel per feature | Simplicity | Hard to scale to many channels | Generic subscription manager |
| Optimistic star toggle | Snappy UI | Inconsistency if failure | Rollback in `onError` (already) |

---
## 16. Common React Patterns Illustrated
- **Hooks**: Custom hooks (e.g., `useAssignTask`) encapsulate mutation logic + typing.
- **Suspense & Lazy**: Progressive delivery of non-critical UI.
- **Optimistic UI**: Mutations update cache instantly then reconcile.
- **Store Selectors** (could be added): Minimize re-renders by selecting slices.
- **Error Boundaries**: Contain failures and prevent full app crashes.
- **Separation of Concerns**: UI vs data vs state vs side-effects.

---
## 17. Fresher-Level Interview Q&A Bank
Below are categorized questions (from basic to intermediate) tailored to this project.

### A. Project & Architecture Basics
1. Explain the difference between server state and client state in this codebase. Give concrete examples.
2. Why was React Query chosen over directly using Axios in components?
3. What problems does Zustand solve that React Query doesn’t?
4. Describe the data flow when a user stars a project.
5. How does the app ensure a seamless UX while loading large feature modules?
6. What are the responsibilities of a Page component vs a domain Component?
7. How are types shared across the application? Why is that beneficial?

### B. React Core Concepts
1. What is the purpose of using `React.lazy` and `Suspense`? Show where it’s used here.
2. What is the difference between controlled and uncontrolled components? Which pattern does `react-hook-form` encourage?
3. Why colocate dialog open state inside a page component instead of a global store?
4. Explain how optimistic updates work with the star/unstar feature.
5. What is the difference between `useState` and a Zustand store? When would you choose each?
6. Explain how dependency arrays in `useEffect` matter for `fetchMembership`.
7. What are potential pitfalls of passing derived arrays (`projectMembers`) every render? How can you optimize?

### C. Performance & Optimization
1. What is code splitting and how is it applied here?
2. How could you reduce first paint time further?
3. When is memoization (`useMemo`) appropriate? Give a candidate in this project.
4. How does React Query reduce unnecessary network requests?
5. Why might dual caching (React Query + sessionStorage) be a problem? Suggest an improvement.
6. Describe a strategy for prefetching project tasks before the user opens a Project Detail page.

### D. State & Data Handling
1. What triggers a React Query refetch?
2. How do you invalidate only affected queries after updating a task?
3. What does the `onMutate` handler in a mutation accomplish?
4. How do persisted Zustand slices work? What is partialization?
5. How would you implement pagination for tasks with infinite scroll?
6. What is the difference between optimistic and pessimistic updates?

### E. Error Handling & Resilience
1. How are API errors surfaced to the user?
2. What happens on a 401 TOKEN_EXPIRED response?
3. How could you centralize form validation error messages?
4. Describe adding a retry strategy for failed queries.
5. How could you prevent a WebSocket reconnection storm?
6. What’s the role of an Error Boundary? Where would you wrap it?

### F. Real-Time & WebSockets
1. Describe the steps from `connect` call to receiving a chat message.
2. Why is SockJS used instead of a native WebSocket directly?
3. How could you extend the WebSocket service to support multiple chat rooms simultaneously?
4. What is a heartbeat and why is it configured?
5. How would you add typing indicators with minimal architectural change?
6. How can you reconcile server-delivered messages with optimistic local ones?

### G. Security & Auth
1. Why is storing JWT in localStorage a risk?
2. How could you migrate to refresh tokens securely?
3. How is logout ensured across stores and caches?
4. What validation would you add to forms to harden security?
5. How would you protect against CSRF if moving tokens to cookies?

### H. Forms & Validation
1. How does `react-hook-form` improve performance vs controlled inputs?
2. What is a resolver and how might `zod` integrate?
3. How would you show inline validation errors under each input?
4. How can you reset a form after successful submission?
5. How to handle server-side validation errors (duplicate email) gracefully?

### I. Testing & Quality
1. Which layers benefit most from unit tests first? Why?
2. How would you mock WebSocket in tests?
3. How can MSW (Mock Service Worker) improve integration test reliability?
4. Write a test idea for optimistic star toggling.
5. How would you verify that a dialog lazy load works in a test environment?

### J. Extensibility / Design Questions
1. How would you implement role-based permissions in UI actions? (Hook? HOC?)
2. Describe adding offline support for tasks (queue + replay). Data structures?
3. Propose a refactor to remove duplicate caching layers.
4. How would you add dark mode theme switching with minimal churn?
5. How to integrate file attachments into the task flow (state + upload progress)?
6. How would you internationalize this app (i18n) and what React features help?

### K. Trade-offs & Alternatives
1. Zustand vs Redux Toolkit here—what are the trade-offs?
2. Why not use Context API instead of Zustand in this app?
3. Why not fetch data directly inside components without React Query?
4. What if we replaced Axios interceptors with React Query `fetchFn` wrappers—pros/cons?
5. Discuss pros/cons of optimistic UI for destructive actions (delete task).

### L. Scenario / Whiteboard Exercises
1. Design a notification real-time update flow using current WebSocket service.
2. Extend analytics to show task burndown chart—data sourcing & caching strategy.
3. Implement infinite scroll for project list—keys, query function, component sketch.
4. Add a global error boundary + fallback UI—where and why.
5. Introduce feature flags—architecture & conditional imports.

### M. Quick Flashcards
- What hook for performing server updates? (Mutation)
- What triggers invalidation? (`queryClient.invalidateQueries`)
- Where is token stored? (localStorage + Zustand persist)
- Which library handles animations? (Framer Motion)
- Which helper merges class names? (`cn` using clsx + tailwind-merge)

---
## 18. Suggested Study Path for Freshers
1. Understand React fundamentals (components, hooks, props vs state)
2. Learn difference between client state vs server state
3. Practice React Query (query keys, mutations, cache invalidation)
4. Explore Zustand basics (store creation, actions, persistence)
5. Implement a tiny feature (e.g., mark task done) end-to-end
6. Add optimistic UI and handle rollback
7. Add a lazy-loaded component
8. Experiment with WebSocket receiving a mock message

---
## 19. Summary Cheat Sheet
| Topic | Key Takeaway |
|-------|--------------|
| State Layers | React Query (server) + Zustand (client) + local component state |
| Caching | React Query + manual sessionStorage (5m TTL) |
| Auth | Token attach via interceptor; logout cascade |
| Real-time | STOMP over SockJS with reconnection guard |
| Performance | Lazy/Suspense, minimal global state, manual cache |
| Error Handling | Centralized + toast notifications |
| Extensibility | Clear domain boundaries; hook-driven patterns |

---
## 20. Final Notes
This architecture balances **simplicity**, **performance**, and **developer approachability**. For scale, focus next on: unified cache strategy, testing harness, security hardening, and real-time event generalization.

Happy learning & interviewing!
