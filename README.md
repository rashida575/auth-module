# Vaultwork — SaaS Authentication Module

A complete, production-shaped authentication module for a SaaS product: login, registration,
email verification, forgot/reset password, OTP verification, a live password strength meter,
remember me, protected routes, and an idle-session timeout warning.

Built with **React 18**, **React Router 6**, and the **Context API** for state — no external
UI or form library, so every interaction is easy to trace and restyle.

> **This is a frontend module with a mocked backend.** Auth calls go through
> `src/services/authService.js`, a single file that simulates a real API (with delay,
> validation, and "issued" verification codes) using `localStorage`. Point that one file at
> your real backend and every screen keeps working unchanged — see **Connecting a real
> backend** below.

---

## Features

| Screen / Concept | Where |
|---|---|
| Login (email + password) | `src/pages/Login.jsx` |
| Register | `src/pages/Register.jsx` |
| Email Verification (OTP) | `src/pages/EmailVerification.jsx` |
| Forgot Password | `src/pages/ForgotPassword.jsx` |
| OTP Verification (reset flow) | `src/pages/OtpVerification.jsx` |
| Reset Password | `src/pages/ResetPassword.jsx` |
| Password Strength Meter | `src/components/PasswordStrengthMeter.jsx` |
| Remember Me | `Login.jsx` + `src/context/AuthContext.jsx` (localStorage vs sessionStorage) |
| Protected Routes | `src/components/ProtectedRoute.jsx` |
| Session Timeout UI | `src/components/SessionTimeoutModal.jsx` + `src/hooks/useIdleTimer.js` |

Reusable primitives: `FormField` (validated input w/ show/hide password), `OtpInput`
(6-digit code entry with auto-advance and paste support), `AuthLayout` (shared split-screen
shell for every auth page).

---

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). It redirects straight to
`/login`.

```bash
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

### Trying the flows

Since there's no real inbox, every verification/reset code is surfaced directly in the UI
under a "Demo mode" note (email verification) or console-logged in
`resendCode`/`requestPasswordReset` (`authService.js` returns `devCode` — wire it up to a
toast if you want it visible on the forgot-password path too). In a real deployment, delete
that dev-mode surfacing once the module is wired to a real email/SMS provider.

To see the **session timeout modal**, sign in and leave the tab idle — a warning appears
after 2 minutes with a 30-second countdown (tune via the `warnAfterMinutes` /
`countdownSeconds` props on `<SessionTimeoutModal />` in `src/App.jsx`).

---

## Project structure

```
src/
  components/       Reusable, presentation-focused pieces (FormField, OtpInput,
                     PasswordStrengthMeter, ProtectedRoute, SessionTimeoutModal, AuthLayout)
  context/           AuthContext — user, isLoading, and every auth action
  hooks/            useIdleTimer — idle detection + countdown for session timeout
  pages/            One component per screen, wired to AuthContext + React Router
  services/         authService.js — the only file that "talks to the backend"
  styles/           index.css — design tokens (colors, type, spacing) + component styles
  utils/            validators.js — shared field validation
```

State management: `AuthContext` holds `user`, `isLoading`, and every auth action
(`login`, `register`, `verifyEmail`, `resendCode`, `requestPasswordReset`, `verifyOtp`,
`resetPassword`, `logout`). Session persistence follows **Remember Me**: checked → stored in
`localStorage` (survives browser restarts); unchecked → stored in `sessionStorage` (cleared
when the tab closes).

---

## Connecting a real backend

Everything above `authService.js` is backend-agnostic. To go live:

1. Replace the body of each function in `src/services/authService.js` with a `fetch` (or your
   SDK client) call to your real endpoints — keep the same function names and return shapes
   and nothing else in the app needs to change.
2. Move password hashing, code issuance, and rate limiting server-side (the mock does none of
   this — it's a UI demonstration, not a security implementation).
3. Swap the `devCode` surfaced in the UI for a real email/SMS send, and remove the "Demo
   mode" hint in `EmailVerification.jsx`.
4. Replace the client-side `ProtectedRoute` check with one backed by a real session
   cookie/JWT validated by your API, if you need server-enforced protection in addition to
   the client-side redirect.

---

## Deploying

This is a static Vite build, so any static host works:

**Vercel**
```bash
npm i -g vercel
vercel
```
Framework preset: Vite. Build command `npm run build`, output directory `dist`.

**Netlify**
```bash
npm run build
# drag-and-drop the dist/ folder at https://app.netlify.com/drop
```
Or connect the GitHub repo with build command `npm run build` and publish directory `dist`.

Because this uses client-side routing (React Router), configure your host to rewrite all
paths to `index.html`:
- Netlify: add a `public/_redirects` file containing `/*  /index.html  200`
- Vercel: handled automatically for Vite projects

---

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Auth module: login, register, verification, reset, OTP, protected routes, session timeout"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

---

## Design notes

Visual identity is a "verification seal" motif — a dark ink brand panel paired with a
parchment-toned form card, a gold seal accent for primary actions and links, and monospace
type (IBM Plex Mono) reserved specifically for anything code-like: OTP digits, the session
countdown, status labels. Fraunces (display serif) carries headlines; Inter carries body copy
and form labels. Colors, type, and spacing are all defined as CSS custom properties at the
top of `src/styles/index.css` — change the palette in one place to reskin the whole module.
