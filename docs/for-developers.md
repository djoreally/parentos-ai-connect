
# Developer Documentation for ParentOS

This document provides a general overview for developers looking to contribute to the ParentOS project.

## 🤖 Full Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Edge Functions)
- **State Management**: TanStack Query (React Query) for server state, React Hooks for local state.
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with CSS-in-JS principles via class variance authority.

## 📁 Project Structure

The project is a monorepo-like structure managed within a single repository, with code organized as follows:

```
.
├── docs/                 # Documentation files
├── public/               # Static assets
├── src/
│   ├── api/              # API layer for communicating with backend services
│   ├── components/       # Reusable React components (UI and domain)
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Integrations with third-party services (e.g., Supabase)
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components for different routes
│   └── types/            # TypeScript type definitions
├── supabase/             # Supabase configuration, migrations, and functions
├── README.md             # Main project README
└── package.json          # Project dependencies and scripts
```

## 🛠️ Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (as package manager)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd parentos-project
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up Supabase:**
    - Start the local Supabase services:
      ```bash
      supabase start
      ```
    - The first time you run this, it will take a few minutes. Once it's done, it will output your local Supabase credentials (API URL, anon key, etc.).

4.  **Set up Environment Variables:**
    - Create a `.env` file in the root of the project.
    - Copy the local Supabase credentials into your `.env` file. You can get these from `supabase status` command.
    ```env
    VITE_SUPABASE_URL=http://127.0.0.1:54321
    VITE_SUPABASE_ANON_KEY=...your-anon-key...
    ```

5.  **Run the development server:**
    ```bash
    bun dev
    ```
    The application should now be running on `http://localhost:5173`.

## 🤝 Contribution Guidelines

- **Branches**: Create a new branch for each feature or bug fix (`feature/new-thing` or `fix/broken-thing`).
- **Commits**: Follow conventional commit standards.
- **Pull Requests**: Open a PR against the `main` branch. Provide a clear description of the changes.
- **Coding Style**: Follow the existing coding style. Run `bun run lint` to check for issues.
