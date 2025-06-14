
# Frontend Developer Documentation

This document provides a deep dive into the frontend architecture of ParentOS.

## ⚛️ Frontend Tech Stack

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest) for server state.
- **Routing**: [React Router DOM](https://reactrouter.com/)

## 📂 Directory Structure

The frontend source code lives in the `src/` directory.

- `src/components/`: Contains all React components.
  - `ui/`: Raw, unstyled components from Shadcn/UI.
  - Custom components are at the root of `components/`.
- `src/pages/`: Page-level components that correspond to routes.
- `src/hooks/`: Custom hooks for reusable logic.
- `src/contexts/`: React context providers.
- `src/lib/utils.ts`: General utility functions, including `cn` from Shadcn.
- `src/api/`: Functions for making requests to our backend.

## 🎨 Styling

We use **Tailwind CSS** for all styling.

- Utility-first classes are preferred.
- For complex component variants, we use `class-variance-authority`.
- Colors and themes are defined in `src/index.css` and configured in `tailwind.config.ts`.

## 🔄 State Management

- **Server State**: We use **TanStack Query (React Query)** to manage data fetching, caching, and synchronization with the backend. Use the `useQuery` and `useMutation` hooks for all interactions with the Supabase API.
- **UI State**: For local component state, use React's built-in `useState` and `useReducer` hooks.
- **Global UI State**: For state that needs to be shared across the application (e.g., auth status), we use React's `useContext` hook. See `src/contexts/AuthContext.tsx`.

## 🗺️ Routing

Routing is handled by **React Router DOM**.
- Routes are defined in `src/App.tsx`.
- The application uses protected routes (`ProtectedRoute`) to manage access based on authentication status.
- New pages should be added to the main router in `App.tsx`.
