
# Backend Developer Documentation

This document covers the backend architecture of ParentOS, which is powered by Supabase.

## supabase Backend Architecture

ParentOS uses [Supabase](https://supabase.com/) as its all-in-one backend-as-a-service (BaaS). This includes:

- **Database**: A PostgreSQL database.
- **Authentication**: Manages user sign-up, sign-in, and session management.
- **Storage**: For file uploads like avatars and documents.
- **Edge Functions**: Serverless functions for custom backend logic.

All Supabase-related code and configuration can be found in the `supabase/` directory.

## 🗃️ Database

The database schema is managed via migrations located in `supabase/migrations/`.

### Key Tables:
- `profiles`: Stores user profile data, linked to `auth.users`.
- `children`: Stores information about each child.
- `logs`: A central table for all entries from parents, teachers, and doctors.
- `child_access`: Manages permissions for which users can access which child's data.

### Row-Level Security (RLS)
We use RLS extensively to ensure users can only access data they are authorized to see. Policies are defined in the migrations.

## 🔐 Authentication

Authentication is handled by Supabase Auth.
- We support email/password login.
- User roles (parent, teacher, doctor) are stored in the `profiles` table.
- A new user's profile is created automatically via a database trigger (`handle_new_user`) on new user signup.

## ☁️ Edge Functions

Custom backend logic is implemented as Deno-based Edge Functions. These are located in `supabase/functions/`.

### Key Functions:
- `ai-assistant`: Handles prompts to the AI model.
- `transcribe-audio`: Processes audio notes.
- `generate-digest`: Creates weekly summaries.

To deploy a new or updated function:
```bash
supabase functions deploy <function-name>
```

## 💻 Local Development

1.  Make sure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
2.  Start the local Supabase stack:
    ```bash
    supabase start
    ```
3.  To apply database migrations:
    ```bash
    supabase db reset
    ```
4.  Local function development is supported via `supabase functions serve`.
