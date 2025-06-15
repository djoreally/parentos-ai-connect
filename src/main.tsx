
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: 'https://us.i.posthog.com',
}

createRoot(document.getElementById("root")!).render(
  <PostHogProvider 
    apiKey="phc_EDPHO2DA8guTgu0VFpYoVKQAArYdpJ0wxq46mv0FYlg"
    options={options}
  >
    <App />
  </PostHogProvider>
);
