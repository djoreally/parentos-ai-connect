
-- Enable the pg_cron extension to allow for scheduling jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage permissions on the cron schema to the postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule a new job named 'daily-log-cleanup'
-- This job will run every day at midnight (00:00) UTC
SELECT cron.schedule(
  'daily-log-cleanup',
  '0 0 * * *',
  $$
    DELETE FROM public.logs WHERE created_at < now() - interval '365 days';
  $$
);
