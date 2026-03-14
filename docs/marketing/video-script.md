# Demo Video Script — CareSync (5 minutes)

## Section 1: Hook (0:00–0:30)

**[Show landing page in background]**

"If you've run a virtual clinic, you know the frustration — legacy EHR systems like Epic and Cerner were built for hospitals, not for modern telehealth. And newer platforms like Healthie still come with complex pricing and steep learning curves.

That's why I built CareSync — a clean, modern EHR platform designed from the ground up for virtual-first healthcare teams."

## Section 2: Product Demo (0:30–2:30)

**[Show the live deployed app at your Vercel URL]**

**Landing Page (15 sec)**
"Here's CareSync. Clean landing page that explains exactly what the platform does and who it's for. Let's dive in."

**Provider Experience (60 sec)**
"Let me log in as a provider — Dr. Sarah Chen, a primary care physician."

[Log in with provider@caresync.demo]

"The provider dashboard gives me an at-a-glance view — today's appointments, total patients, and pending clinical notes."

[Navigate to Patients]
"I can see all my patients, search by name, and click into any patient to see their full history."

[Click into a patient → show tabs]
"Each patient has their appointments, clinical notes, and medical records organized in tabs."

[Navigate to an appointment → write a note]
"When I complete an appointment, I write a SOAP clinical note right here — Subjective, Objective, Assessment, Plan. It's linked to the appointment and the patient's record."

**Patient Experience (45 sec)**
[Log out, log in as patient@caresync.demo]

"Now let me switch to the patient view. Jordan can see their upcoming appointments, health summary, and medical records."

[Navigate to appointments → book new]
"Booking is simple — pick a provider, choose a date and time, select the appointment type, and confirm."

[Show health records]
"Patients can view their conditions, medications, and allergies — all maintained by their care team."

**Admin Experience (15 sec)**
[Log out, log in as admin@caresync.demo]

"Admins get a system-wide view — total users, activity stats, and full user management with role controls."

## Section 3: Tech Stack (2:30–3:30)

**[Can show code briefly or stay on the app]**

"CareSync is built with Next.js 15 using the App Router and TypeScript for type safety. The backend is powered by Supabase — PostgreSQL database with Row Level Security on every single table, ensuring patients only see their own data and providers only access their assigned patients.

Authentication uses Supabase Auth with three roles — patient, provider, and admin — each with their own dashboard and permissions.

The UI is built with shadcn/ui and Tailwind CSS for a polished, responsive design. The whole thing is deployed on Vercel with continuous deployment from GitHub.

I built this using Codex CLI for AI-assisted development — [mention one specific example, e.g., 'it generated the entire database schema with 8 tables and their RLS policies in a single prompt']."

## Section 4: Why Better (3:30–4:30)

"Compared to Healthie, CareSync focuses on simplicity and speed. There's no complex setup, no long onboarding process. A new clinic can sign up and start scheduling appointments in under a minute.

Unlike legacy EHR systems that require months of implementation, CareSync is a modern web app that works on any device, any browser.

The role-based architecture means everyone — patients, providers, and administrators — gets exactly the view they need. And with Row Level Security enforced at the database level, data privacy isn't an afterthought — it's built into the foundation."

## Section 5: CTA (4:30–5:00)

**[Show landing page or CareSync logo]**

"Speed matters. Quality matters. Scale matters. If you want your application built quickly with enterprise-grade security and performance — Bacancy is your technology partner. Connect with us today."

**[End with product URL on screen]**

---

## Recording Notes
- Use the DEPLOYED app (Vercel URL), not localhost
- Log into each role beforehand so credentials are ready
- Keep mouse movements smooth and deliberate
- Speak at a natural pace — you have 5 full minutes
- If you stumble, just keep going — one take is fine if it's smooth enough
