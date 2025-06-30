import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx'
import './index.css'
import { PostHogProvider } from 'posthog-js/react'

const PUBLISHABLE_KEY = "pk_live_Y2xlcmsucGFyZW50cmFrLmNvbSQ";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <PostHogProvider 
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY || "phc_EDPHO2DA8guTgu0VFpYoVKQAArYdpJ0wxq46mv0FYlg"}
        options={options}
      >
        <App />
      </PostHogProvider>
    </ClerkProvider>
  </StrictMode>
);