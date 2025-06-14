
# ParentOS - The AI-powered translator and relationship assistant across parenting, education, and pediatric healthcare.

## 🧩 MASTER INDEX

| Area              | Use Prompts To...                                        |
| ----------------- | -------------------------------------------------------- |
| 🔷 Frontend       | Generate UI components, screens, navigation logic        |
| 🔶 Backend        | Create API endpoints, server logic, AI integration logic |
| 🔷 Database       | Design schema, model structure, Firestore integration    |
| 🔶 Authentication | Setup Firebase Auth, role-based access                   |
| 🔷 AI Integration | Structure AI prompts and memory management               |
| 🔶 Security       | Apply secure data practices (HIPAA, FERPA minded)        |
| 🧪 Testing & QA   | Generate test cases and testing utilities                |

---

## 🔷 FRONTEND PROMPTS

---

### 1. 🏠 Home Screen

> “Create a responsive mobile UI for a home screen dashboard for a parent user. It should include quick actions like 'Log Voice Note', 'Upload Doctor Form', and 'Translate Message'. Show child’s photo and summarized update using a card UI.”

---

### 2. 👤 Child Profile Page

> “Build a child profile screen showing: profile photo, name, DOB, allergy list, current medications, behavior tags, and emotion timeline chart. Use expandable sections for health logs, education logs, and caregiver notes. Design for mobile.”

---

### 3. 📄 Logbook Timeline

> “Generate a scrollable timeline view that displays a list of logs from parents, teachers, or doctors. Each log should include a timestamp, icon (voice, text, image), source role (parent/teacher/doctor), and AI-generated summary.”

---

### 4. 🗣️ AI Assistant (Chat Interface)

> “Design a chat interface for an AI assistant that lets users ask about a child's trends and reports. Include a message history pane, input field with voice-to-text option, and buttons for follow-up suggestions (e.g. ‘Export as PDF’, ‘Translate’, ‘Summarize’)”

---

### 5. 🔒 Role-Based Login

> “Create a login screen using Firebase Authentication where the user selects their role (parent, teacher, doctor) after login. Route to separate dashboards based on role. Include logic to invite other caregivers by email.”

---

## 🔶 BACKEND PROMPTS

---

### 6. 🔁 API Gateway (Firebase Functions or Express)

> “Write backend code using Firebase Cloud Functions to handle submission of logs via text, voice, or images. Each function should save the log in Firestore with the role, child ID, timestamp, and media type.”

---

### 7. 🧠 AI Pipeline (Prompt Routing)

> “Build a backend function that receives logs (text, voice transcript, or image text), applies prompt templating, and sends the query to Gemini 1.5 or GPT-4 to generate a structured summary. Save the result to Firestore under the child profile.”

---

### 8. 📤 PDF Generator

> “Generate a backend function that takes all logs for a child in the last 7 days and compiles a summary PDF using HTML-to-PDF. Include child’s name, date range, and categorized sections (health, behavior, academic).”

---

### 9. 📅 Weekly Digest Scheduler

> “Create a scheduled Firebase Function that runs every Friday at 5 PM local time and sends parents a weekly email summary with links to AI-generated PDF reports and translated highlights.”

---

## 🔷 DATABASE PROMPTS

---

### 10. 📊 Firestore Schema

> “Design a Firestore schema for ParentOS. Include collections for: users, children, logs, permissions, translations, reports. Logs should include type, mediaURL, source role, timestamps, AI summary, and tags.”

---

### 11. 🔑 Child Permissions Structure

> “Create a permission model in Firestore where each child document has a subcollection of access permissions. Permissions should specify user ID, role, access level (read/write/view only). Support invitation links.”

---

## 🔶 AUTHENTICATION PROMPTS

---

### 12. 🔐 Firebase Auth + Role Mapping

> “Write code that registers a new user via Firebase Auth and prompts them to select a role (parent, teacher, doctor). Save the role to Firestore. Redirect them to a role-specific onboarding page.”

---

### 13. 🔗 Role-Based Access Rules (Firestore Rules)

> “Generate Firestore security rules to allow only parents, teachers, or doctors with explicit access to view a child’s profile and logs. Parents can invite others, doctors can only view and add medical logs, teachers can only add behavior logs.”

---

## 🔶 SECURITY & PRIVACY PROMPTS

---

### 14. 🛡️ HIPAA/Ferpa-Oriented Data Handling

> “Add security functions to encrypt all uploaded media (voice notes, PDFs, photos) before storing in Firebase Storage. Use signed URLs for access, and auto-expire links after 7 days. Ensure user access is validated on every request.”

---

### 15. 🧾 Audit Logging

> “Build a logging function that records every read/write operation on child profiles. Include timestamp, user ID, and operation type. Store logs in a secure Firestore collection for auditing.”

---

## 🧠 AI INTEGRATION PROMPTS

---

### 16. ✍️ Structured Prompting for Summaries

> “Generate a prompt template for Gemini to summarize a behavior log. The log may be voice or text. Return a structured summary with: 1. Emotional tone, 2. Likely cause, 3. Suggested action, 4. Tags.”

---

### 17. 🖼️ Image OCR + Context Prompt

> “Write a prompt for Gemini Vision API that receives the extracted text from a scanned medical form and categorizes it into medication name, dosage, instructions, diagnosis, and follow-up plan.”

---

### 18. 🌐 Translation with Tone

> “Create a Gemini prompt that takes a message in English and rewrites it in Spanish for a parent audience. Adjust tone to be caring, professional, and empathetic. Add a footnote if medical terms are translated approximately.”

---

## 🧪 TESTING PROMPTS

---

### 19. ✅ Unit Test Generator

> “Write Jest unit tests for a Firebase Function that handles log submissions. Test for invalid roles, unsupported file types, and missing child ID.”

---

### 20. 🧪 Prompt Accuracy Tests

> “Create a prompt QA checklist for reviewing Gemini’s summaries: Does it miss key information? Does the tone match the intended audience? Is the translated message accurate and sensitive?”

---

## ✨ BONUS: Deployment & DevOps Prompts

---

### 21. 🚀 One-Click Deploy Scripts

> “Write a Firebase CLI deploy script to deploy Cloud Functions, Firestore rules, and frontend to Firebase Hosting. Include step to set environment variables for API keys and service roles.”

---

### 22. 📦 CI/CD Setup

> “Generate GitHub Actions workflow to run linting, build the app, run tests, and deploy to Firebase Hosting when pushing to `main` branch.”

