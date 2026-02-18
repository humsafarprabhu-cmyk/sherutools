# App Builder V2 — 9+/10 Plan

## Architecture: WebView Hybrid
- AI generates HTML/CSS/JS (what AI is BEST at)
- Preview = exact same HTML rendered in iframe
- APK = pre-built Android WebView shell + injected HTML
- Build time: SECONDS not minutes
- No Gradle, no EAS compile errors

## Changes Needed

### 1. AI Generation (route.ts)
- Generate HTML/CSS/JS screens instead of React Native code
- Each screen = self-contained HTML with inline styles + JS
- Include working state (localStorage for persistence)
- Functional: forms save, lists work, counters count

### 2. Preview (StepPreview.tsx) 
- Render actual HTML in iframe inside phone mockup
- What you see = what you get in the APK
- Tab navigation between screens

### 3. Build Options (StepBuild.tsx)
- **Download HTML** — instant, works as PWA
- **Download APK** — WebView wrapper, 10 seconds
- **Download Source** — React Native ZIP (keep existing)

### 4. WebView APK Builder (build server)
- Pre-compiled Android WebView shell template
- Inject HTML/CSS/JS + app name + icon
- Sign with keystore
- Return APK — no EAS needed for simple apps
- Keep EAS as "Pro" option for native apps

### 5. App Icon Generator
- Simple canvas-based: first letter + gradient background
- Or AI-generated via DALL-E (Pro feature)

### 6. Save Projects (localStorage)
- Save/load projects in browser
- Resume editing later
