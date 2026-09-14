# Vaultline — SaaS Authentication Module

A complete, self-contained authentication module for a SaaS product: login,
registration, email verification, forgot/reset password, OTP verification,
password strength feedback, remember me, protected routes, and a
session-timeout warning — built with React, React Router, and Context-based
state management, no UI library dependency.

> This repo ships a fully working front end with a **mocked auth layer**
> (in-memory + `localStorage`/`sessionStorage`). Swap the calls in
> `src/context/AuthContext.jsx` and the page `setTimeout` blocks for real
> API requests to wire it up to a backend.

## Screens

| Screen | Route | Notes |
|---|---|---|
| Login | `/login` | Email + password validation, Remember me, links to register/forgot password |
| Register | `/register` | Live password strength meter, confirm-password check |
| Email Verification | `/verify-email` | Resend action, link into OTP flow |
| Forgot Password | `/forgot-password` | Sends mock reset link, link into OTP flow |
| Reset Password | `/reset-password` | New password + strength meter + confirmation |
| OTP Verification | `/verify-otp` | 6-digit segmented input, auto-advance, paste support, expiry countdown |
| Dashboard (protected) | `/dashboard` | Only reachable when authenticated; shows live session state |
| 404 | `*` | Fallback for unknown routes |

## Key concepts covered

- **React Router** — all screens are routed with `react-router-dom`;
  unauthenticated visits to `/dashboard` redirect to `/login` and back
  again after sign-in (`ProtectedRoute.jsx`).
- **Form validation** — inline, per-field validation for email format,
  required fields, password strength threshold, and password confirmation
  matching (`utils/validation.js`).
- **Reusable components** — `FormField`, `PasswordStrengthMeter`,
  `OtpInput`, `AuthLayout`, `ProtectedRoute`, `SessionTimeoutModal` are all
  shared across screens rather than duplicated per page.
- **State management** — a single `AuthContext` (React Context + hooks)
  owns the session: who's logged in, remember-me persistence, and the idle
  timer that drives the session-timeout modal.
- **Session timeout UI** — after a period of inactivity the app shows a
  countdown modal ("Stay signed in" / "Sign out"); if ignored, the session
  ends automatically. Any mouse/keyboard/scroll activity resets the timer.

## Getting started

```bash
npm install
npm run dev       # start local dev server (Vite)
npm run build      # production build -> dist/
npm run preview    # preview the production build locally
```

The app opens on `/login`. Any syntactically valid email + a password of
6+ characters will "sign you in" (mock auth — see `AuthContext.jsx`).

## Project structure

```
src/
  App.jsx                     Route table
  main.jsx                    Entry point (BrowserRouter)
  index.css                   Design tokens + all component styles
  context/
    AuthContext.jsx           Session state, remember me, idle/timeout logic
  components/
    AuthLayout.jsx            Shared two-pane auth shell (brand panel + card)
    FormField.jsx             Text/password input with validation + show/hide
    PasswordStrengthMeter.jsx Segmented strength meter + rule checklist
    OtpInput.jsx               6-digit code input with auto-advance/paste
    ProtectedRoute.jsx        Route guard, redirects to /login when signed out
    SessionTimeoutModal.jsx   Idle-timeout warning with countdown
  pages/
    Login.jsx
    Register.jsx
    EmailVerification.jsx
    ForgotPassword.jsx
    ResetPassword.jsx
    OtpVerification.jsx
    Dashboard.jsx              Protected example page
    NotFound.jsx
  utils/
    validation.js              Email regex, password rules/score
```

## Wiring up a real backend

Everything network-shaped is isolated so it's a small diff to connect a
real API:

1. `AuthContext.login` / `logout` — replace the local record with your
   API's session/token response; keep the `rememberMe` branch to choose
   `localStorage` (persists across browser restarts) vs `sessionStorage`
   (cleared when the tab closes).
2. Each page's `setTimeout(...)` block simulating a request — replace with
   a real `fetch`/API client call, surfacing errors via the existing
   `error` / `banner-error` UI states.
3. `OtpVerification.jsx` — point "Resend code" and "Verify code" at your
   OTP provider; the countdown/expiry UI is already wired to arbitrary
   durations.
4. Idle/timeout thresholds live at the top of `AuthContext.jsx`
   (`IDLE_WARNING_MS`, `IDLE_LOGOUT_MS`) — tune to match your session
   policy.

## Deploying

This is a static Vite build, so it deploys to any static host:

```bash
npm run build
# deploy the generated dist/ folder to Vercel, Netlify, Cloudflare Pages, etc.
```

For GitHub Pages specifically, set `base` in `vite.config.js` to your repo
name before building.

## Tech

React 18 · React Router 6 · Vite 5 · plain CSS (design tokens, no UI kit)
