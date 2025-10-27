# 🧭 The dial Landing Page Build Brief

## 🎯 Product Context

**Audience:**  
Phone-reliant professionals — real estate agents, brokers, and salespeople — who handle many client calls daily and want automatic recording, transcription, and summaries without changing their number or workflow.

**Promise:**  
Keep your number. Keep your workflow. Let AI handle memory, transcription, and organization.

**Core Value:**  
Peace of mind + productivity + professionalism.

---

## 🧩 Page Structure Overview

Your landing page will have 6 core sections, each guiding the visitor from awareness → trust → action.

---

### 1️⃣ Navigation (Minimal Header)

**Goal:** Remove friction, keep focus on CTA.

**Instructions for the LLM:**

- Use a simple top bar with only:
  - Logo or product name placeholder (e.g., `[LOGO]` or `thedial`)
  - One CTA button → “Try it Free”
- No social icons, no dropdown menus.
- Keep it sticky (optional).
- Use white or transparent background with shadow on scroll.

**Example layout:**

---

### 2️⃣ Hero Section

**Goal:** Instantly communicate product value and trigger emotion.

**Instructions:**

- Clean gradient or light background
- Center-align headline, subheadline, CTA, and small proof line
- Visual: phone mockup showing AI assistant transcribing a call

**Content Guide:**  
**Headline Options:**

> “Turn every client call into searchable notes — without changing how you call.”

**Subheadline:**

> Automatically record, transcribe, and organize your business calls using AI.  
> Works seamlessly with iPhone, Android, and VoIP.  
> Keep your number. Keep your workflow. Get your time back.

**CTAs:**

- Primary: 👉 Try it free →
- Secondary (link): Watch how it works

**Beneath CTA:**

> Trusted by professionals who live on their phones — from real estate to finance.

**Design Notes:**

- Headline: `text-4xl font-bold text-center`
- Subheadline: `text-lg text-muted-foreground`
- CTA: bright, rounded button (primary color)
- Microcopy: small, muted, centered

---

### 3️⃣ Core Benefits Section

**Goal:** Translate product features into emotional, outcome-driven benefits.

**Instructions:**

- 3–4 benefit cards in a grid layout
- Each card has:
  - Emoji or minimal icon
  - Short bold headline
  - One-sentence description

**Content:**  
✅ **Never lose a detail again.**  
Every call is securely recorded, transcribed, and summarized in real time.

🧠 **Instant clarity, zero effort.**  
Get automatic summaries and tags for each conversation so you can find and revisit leads in seconds.

📱 **Keep your trusted number.**  
Works silently in the background on iPhone, Android, or VoIP.

🤝 **Close more deals, stress less.**  
Spend more time with clients — your calls become searchable insights.

**LLM Design Notes:**

- 2x2 grid on desktop, stacked on mobile
- Use alternating background colors (white / light gray)
- Add gentle hover or fade-in motion to cards

---

### 4️⃣ Explanation / Visual Demo Section

**Goal:** Show how it works visually and logically

**Instructions:**

- Split layout (image left, text right)
- Image: AI call interface or waveform animation

**Steps:**  
1️⃣ **Talk as usual.** Your AI joins automatically.  
2️⃣ **AI transcribes & summarizes.** Everything saved for you.  
3️⃣ **Search or review anytime.** Your memory, enhanced.

**Optional CTA (bottom of section):**

> Try it free — let your next call organize itself.

---

### 5️⃣ Proof & Trust (Microcopy Reinforcement)

**Goal:** Reassure and legitimize right at the moment of decision

**Instructions:**

- Place directly under the main CTA or in a minimal full-width band
- Keep copy concise and neutral

**Content:**

> Trusted by professionals who live on their phones — from real estate to finance.

**Optional add-ons:**

- Light gray logos (e.g., “as seen in” or industry badges)
- Security icon 🔒 for privacy reassurance

**Styling:**

- `text-sm text-center text-muted-foreground`
- 40–60% opacity gray if using on light background

---

### 6️⃣ Clean Design Principles (Visual Hierarchy + Flow)

**Goal:** Maintain clarity and modern trustworthiness

**LLM Design Rules:**

- **Color Palette:**
  - Background: white or soft gradient
  - Primary: #fd753e
  - Text/Neutral: #36322E
- **Typography:**
  - Headings: bold sans-serif (Inter / Satoshi / SF Pro)
  - Body: readable 16–18px
- **Spacing:** generous padding (`p-8 md:p-16`), max width `max-w-4xl mx-auto`
- **Imagery:** show AI working subtly (not dashboards)
- **Motion:** subtle fade-ins, not flashy animations
- **Navigation & Footer:** minimal, distraction-free

---

### 7️⃣ Footer

**Goal:** Offer context without clutter

**Instructions:**

- Keep footer ultra-light
- Include only:
  - Logo or name
  - Privacy Policy / Terms links
  - Small copyright line

**Example:**

---

### 🧠 LLM Prompting Guidance

> You are designing a landing page for **thedial**, an AI Call Assistant SaaS.  
> Follow the exact structure and design rules in this file.  
> Prioritize clarity, whitespace, and emotion-driven storytelling.  
> Generate modern, mobile-first **Tailwind React markup**.  
> All copy must sound human, confident, and benefit-focused.  
> Avoid technical jargon (no “WebRTC,” “TTS,” etc.).  
> End each section with a clear visual or emotional cue leading toward the CTA.
