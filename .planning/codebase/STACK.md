# Technology Stack

**Analysis Date:** 2026-04-06

## Languages

**Primary:**
- HTML5 - All page structure (`index.html`, `resultats.html`, `appel.html`)
- CSS3 - All styling, inline and external (`style.css`)
- JavaScript (ES6+, vanilla) - UI logic, state management, API calls (`script.js`)

**Secondary:**
- None — pure frontend, no backend runtime required

## Runtime

**Environment:**
- Browser only — no Node.js, no build pipeline, no compilation step
- Modern browser with ES6+ support required
- No server-side execution

**Package Manager:**
- None installed locally
- No `package.json`, no lockfile
- No dependencies managed via npm or yarn

## Frameworks

**Core:**
- None — vanilla HTML/CSS/JavaScript

**Styling:**
- CSS custom properties (CSS variables) for design tokens
- No CSS preprocessor (no Sass, Less, Postcss)
- No CSS-in-JS

**Testing:**
- None — no test framework configured

**Build/Dev:**
- None — no build step
- Static file hosting only
- Files served as-is from browser (HTML → CSS → JS)

## Key Dependencies

**External Libraries:**
- `marked.js` - Markdown-to-HTML parser for parsing Claude-generated analysis text
  - Loaded via CDN: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`
  - Used in: `resultats.html` (not shown in provided files but referenced in tech context)
  - Version: Unspecified (latest via jsDelivr)

**Fonts:**
- `Inter` (weights 300, 400) - Primary font family
  - Loaded via: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400&display=swap`
  - Used throughout all pages

**Scheduling/Booking:**
- Calendly widget (embedded iframe)
  - SDK: `https://assets.calendly.com/assets/external/widget.js`
  - Used in: `appel.html`
  - Calendly endpoint: `https://calendly.com/contact-remidene-enzo/30min`

## Configuration

**Environment:**
- No `.env` file in use
- All configuration hardcoded in source files:
  - Webhook URLs in `script.js` (lines 2-3): `WEBHOOK_URL` and `PING_URL`
  - Calendly URL in `appel.html` (line 214)
  - API base URL: `https://enzo-os.vercel.app/api/quiz`

**Build:**
- No build configuration files
- No bundler config (Webpack, Vite, Parcel, etc.)
- No transpiler config (Babel, SWC, etc.)
- Static HTML/CSS/JS served directly

**Versioning:**
- Git tracked (`.git` directory present)
- No semantic versioning scheme

## Platform Requirements

**Development:**
- Text editor or IDE (no specific requirement)
- Git for version control
- Web browser for preview
- Static file server optional (can open `index.html` directly in browser)

**Production:**
- Static file hosting (GitHub Pages, Vercel, Netlify, or any HTTP server)
- No server-side runtime required
- No database required
- CDN for external libraries (Google Fonts, jsDelivr, Calendly)

**Browser Support:**
- ES6+ syntax requirement (arrow functions, template literals, const/let, destructuring)
- Assumes modern browsers (Chrome, Firefox, Safari, Edge from ~2018+)
- No polyfills or legacy browser support

---

*Stack analysis: 2026-04-06*
