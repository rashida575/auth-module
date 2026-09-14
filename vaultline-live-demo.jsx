import React, { useState, useEffect, useRef, useCallback } from "react";

/* ---------------------------------------------------------
   Vaultline — Auth Module Live Demo
   Same design system & flows as the full Vite/React Router
   project, compressed into one file with state-based nav
   (this preview has no router / no real network calls).
   Idle-timeout is sped up (15s / 25s) so it's visible live.
--------------------------------------------------------- */

const T = {
  ink: "#14171f",
  surface: "#1b1f2e",
  surface2: "#232842",
  border: "#2b3049",
  borderSoft: "#23273b",
  text: "#edeef3",
  dim: "#9498ac",
  faint: "#62667c",
  accent: "#5b8def",
  accentDim: "#2f4a8a",
  mint: "#3dd9a8",
  coral: "#f2637b",
  amber: "#f2a93d",
  fontDisplay: "'Space Grotesk', ui-sans-serif, sans-serif",
  fontBody: "'Inter', ui-sans-serif, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, monospace",
};

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());
const rules = [
  { id: "length", label: "8+ characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "Number", test: (p) => /[0-9]/.test(p) },
  { id: "symbol", label: "Symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
];
const score = (p) => {
  if (!p) return 0;
  const n = rules.filter((r) => r.test(p)).length;
  return p.length >= 12 && n === rules.length ? 4 : Math.min(n, 4);
};
const meta = [
  { label: "Very weak", color: T.coral },
  { label: "Weak", color: T.coral },
  { label: "Fair", color: T.amber },
  { label: "Strong", color: T.mint },
  { label: "Very strong", color: T.mint },
];

function Field({ label, type = "text", value, onChange, error, hint, placeholder }) {
  const [reveal, setReveal] = useState(false);
  const isPw = type === "password";
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.dim, marginBottom: 6 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input
          type={isPw ? (reveal ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%", background: T.surface, border: `1px solid ${error ? T.coral : T.border}`,
            color: T.text, borderRadius: 6, padding: "11px 12px", fontSize: 14.5, fontFamily: T.fontBody,
            outline: "none",
          }}
        />
        {isPw && (
          <button type="button" onClick={() => setReveal((r) => !r)} tabIndex={-1}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.faint, fontSize: 12, cursor: "pointer", fontFamily: T.fontMono }}>
            {reveal ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>
      {error && <div style={{ color: T.coral, fontSize: 12.5, marginTop: 6 }}>{error}</div>}
      {!error && hint && <div style={{ color: T.faint, fontSize: 12.5, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function Strength({ password }) {
  const s = score(password);
  const m = meta[s];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 4, height: 5 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, borderRadius: 3, background: i < s ? m.color : T.border }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontFamily: T.fontMono, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: T.faint }}>
        <span>Password strength</span>
        <span style={{ color: password ? m.color : undefined }}>{password ? m.label : "—"}</span>
      </div>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {rules.map((r) => {
          const met = r.test(password || "");
          return (
            <div key={r.id} style={{ fontSize: 12, color: met ? T.mint : T.faint, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
              {r.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Otp({ value, onChange, length = 6 }) {
  const refs = useRef([]);
  const setDigit = (i, d) => {
    const chars = value.split("");
    chars[i] = d;
    onChange(chars.join("").slice(0, length));
  };
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "6px 0 20px" }}
      onPaste={(e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (pasted) { e.preventDefault(); onChange(pasted); }
      }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            setDigit(i, d || "");
            if (d && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          style={{
            width: 46, height: 54, textAlign: "center", fontFamily: T.fontMono, fontSize: 20, fontWeight: 600,
            background: T.surface, border: `1px solid ${value[i] ? T.accentDim : T.border}`, borderRadius: 6, color: T.text, outline: "none",
          }}
        />
      ))}
    </div>
  );
}

function Btn({ children, primary, onClick, disabled, type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        width: "100%", padding: "12px 16px", borderRadius: 6, border: primary ? "none" : `1px solid ${T.border}`,
        background: primary ? T.accent : "transparent", color: primary ? "#0c0e14" : T.text,
        fontSize: 14.5, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
        fontFamily: T.fontBody,
      }}>
      {children}
    </button>
  );
}

function Banner({ tone = "info", children }) {
  const colors = { success: T.mint, error: T.coral, info: T.accent };
  const c = colors[tone];
  return (
    <div style={{ padding: "12px 14px", borderRadius: 6, fontSize: 13, lineHeight: 1.5, marginBottom: 20, border: `1px solid ${c}55`, background: `${c}14`, color: c }}>
      {children}
    </div>
  );
}

function Link({ children, onClick }) {
  return <a onClick={onClick} style={{ color: T.accent, fontSize: 13.5, textDecoration: "none", fontWeight: 500, cursor: "pointer" }}>{children}</a>;
}

function Shell({ eyebrow, title, subtitle, children }) {
  return (
    <div style={{ minHeight: 560, display: "grid", gridTemplateColumns: "0.85fr 1fr", background: T.ink, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.borderSoft}` }}>
      <aside style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 40, background: "linear-gradient(160deg, #1a2036 0%, #12141d 100%)", borderRight: `1px solid ${T.borderSoft}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 18, color: T.text }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.mint, boxShadow: `0 0 0 4px ${T.mint}26` }} />
          Vaultline
        </div>
        <div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 30, lineHeight: 1.15, fontWeight: 600, maxWidth: 340, margin: 0, color: T.text }}>
            Access, verified at every step.
          </h2>
          <p style={{ color: T.dim, fontSize: 14, lineHeight: 1.6, maxWidth: 320, marginTop: 14 }}>
            Vaultline pairs session-aware auth with clear, honest feedback so people always know what state their account is in.
          </p>
        </div>
        <div style={{ display: "flex", gap: 18, fontFamily: T.fontMono, fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <span>UPTIME <b style={{ color: T.mint }}>99.98%</b></span>
          <span>2FA <b style={{ color: T.mint }}>ENFORCED</b></span>
        </div>
      </aside>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          {eyebrow && <div style={{ fontFamily: T.fontMono, fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.accent, marginBottom: 10 }}>{eyebrow}</div>}
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: 25, fontWeight: 600, margin: "0 0 6px", color: T.text }}>{title}</h1>
          {subtitle && <p style={{ color: T.dim, fontSize: 14, lineHeight: 1.55, margin: "0 0 26px" }}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export default function VaultlineDemo() {
  const [screen, setScreen] = useState("login");
  const [session, setSession] = useState(null); // { email, rememberMe }
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpPurpose, setOtpPurpose] = useState("verify");

  // ---- idle/session-timeout demo state (sped up: 15s warn, 25s logout) ----
  const [showWarn, setShowWarn] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const warnTimer = useRef(null);
  const logoutTimer = useRef(null);
  const countdown = useRef(null);

  const clearTimers = useCallback(() => {
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(countdown.current);
  }, []);

  const startCountdown = useCallback(() => {
    setSecondsLeft(10);
    setShowWarn(true);
    countdown.current = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
  }, []);

  const resetIdle = useCallback(() => {
    clearTimers();
    setShowWarn(false);
    if (screen !== "dashboard") return;
    warnTimer.current = setTimeout(startCountdown, 15000);
    logoutTimer.current = setTimeout(() => {
      setSession(null);
      setScreen("login");
      setShowWarn(false);
    }, 25000);
  }, [screen, clearTimers, startCountdown]);

  useEffect(() => {
    if (screen !== "dashboard") { clearTimers(); setShowWarn(false); return; }
    resetIdle();
    const onActivity = () => { if (!showWarn) resetIdle(); };
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  return (
    <div style={{ fontFamily: T.fontBody, padding: 20, background: "#0d0f16", minHeight: "100%" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />

      {screen === "login" && <LoginScreen setScreen={setScreen} setSession={setSession} setPendingEmail={setPendingEmail} setOtpPurpose={setOtpPurpose} />}
      {screen === "register" && <RegisterScreen setScreen={setScreen} setPendingEmail={setPendingEmail} />}
      {screen === "verify-email" && <VerifyEmailScreen email={pendingEmail} setScreen={setScreen} setOtpPurpose={setOtpPurpose} />}
      {screen === "forgot" && <ForgotScreen setScreen={setScreen} setPendingEmail={setPendingEmail} setOtpPurpose={setOtpPurpose} />}
      {screen === "otp" && <OtpScreen email={pendingEmail} purpose={otpPurpose} setScreen={setScreen} />}
      {screen === "reset" && <ResetScreen setScreen={setScreen} />}
      {screen === "dashboard" && (
        <DashboardScreen
          session={session}
          setScreen={setScreen}
          setSession={setSession}
          showWarn={showWarn}
          secondsLeft={secondsLeft}
          onStay={resetIdle}
        />
      )}
    </div>
  );
}

function LoginScreen({ setScreen, setSession, setPendingEmail, setOtpPurpose }) {
  const [email, setEmail] = useState("demo@vaultline.app");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setServerError("");
    const next = {};
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (password.length < 6) { setServerError("Incorrect email or password."); return; }
      setSession({ email, remember });
      setScreen("dashboard");
    }, 600);
  };

  return (
    <Shell eyebrow="Sign in" title="Welcome back" subtitle="Enter your credentials to access your workspace.">
      {serverError && <Banner tone="error">{serverError}</Banner>}
      <form onSubmit={submit}>
        <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@company.com" />
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder="6+ characters to sign in" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 22px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: T.dim, cursor: "pointer" }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Link onClick={() => setScreen("forgot")}>Forgot password?</Link>
        </div>
        <Btn primary type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Btn>
      </form>
      <p style={{ textAlign: "center", fontSize: 13.5, color: T.dim, marginTop: 24 }}>
        New to Vaultline? <Link onClick={() => setScreen("register")}>Create an account</Link>
      </p>
      <p style={{ textAlign: "center", fontSize: 11.5, color: T.faint, marginTop: 14, fontFamily: T.fontMono }}>
        demo: any valid email + password 6+ chars
      </p>
    </Shell>
  );
}

function RegisterScreen({ setScreen, setPendingEmail }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Tell us your name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (score(form.password) < 2) next.password = "Choose a stronger password.";
    if (form.confirm !== form.password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPendingEmail(form.email);
      setScreen("verify-email");
    }, 600);
  };

  return (
    <Shell eyebrow="Create account" title="Set up your workspace" subtitle="Takes less than a minute.">
      <form onSubmit={submit}>
        <Field label="Full name" value={form.name} onChange={upd("name")} error={errors.name} placeholder="Jordan Ahmed" />
        <Field label="Email" value={form.email} onChange={upd("email")} error={errors.email} placeholder="you@company.com" />
        <Field label="Password" type="password" value={form.password} onChange={upd("password")} error={errors.password} placeholder="Create a password" />
        <Strength password={form.password} />
        <div style={{ marginTop: 16 }}>
          <Field label="Confirm password" type="password" value={form.confirm} onChange={upd("confirm")} error={errors.confirm} placeholder="Re-enter your password" />
        </div>
        <Btn primary type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</Btn>
      </form>
      <p style={{ textAlign: "center", fontSize: 13.5, color: T.dim, marginTop: 24 }}>
        Already have an account? <Link onClick={() => setScreen("login")}>Sign in</Link>
      </p>
    </Shell>
  );
}

function VerifyEmailScreen({ email, setScreen, setOtpPurpose }) {
  const [resent, setResent] = useState(false);
  return (
    <Shell eyebrow="One more step" title="Verify your email" subtitle={`We sent a confirmation link to ${email || "your inbox"}.`}>
      {resent && <Banner tone="success">Verification email resent.</Banner>}
      <Banner tone="info">Didn't get it? Check spam, or confirm the address is correct.</Banner>
      <Btn primary disabled={resent} onClick={() => { setResent(true); setTimeout(() => setResent(false), 3000); }}>
        {resent ? "Sent" : "Resend verification email"}
      </Btn>
      <div style={{ marginTop: 10 }}>
        <Btn onClick={() => { setOtpPurpose("verify"); setScreen("otp"); }}>Enter code manually instead</Btn>
      </div>
      <p style={{ textAlign: "center", fontSize: 13.5, color: T.dim, marginTop: 24 }}>
        <Link onClick={() => setScreen("register")}>Go back</Link>
      </p>
    </Shell>
  );
}

function ForgotScreen({ setScreen, setPendingEmail, setOtpPurpose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) { setError("Enter a valid email address."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); setPendingEmail(email); }, 600);
  };

  if (sent) {
    return (
      <Shell eyebrow="Check your inbox" title="Reset link sent" subtitle={`We emailed a password reset link to ${email}.`}>
        <Btn primary onClick={() => { setOtpPurpose("reset"); setScreen("otp"); }}>I have a code instead</Btn>
        <p style={{ textAlign: "center", fontSize: 13.5, color: T.dim, marginTop: 24 }}>
          <Link onClick={() => setScreen("login")}>Back to sign in</Link>
        </p>
      </Shell>
    );
  }

  return (
    <Shell eyebrow="Reset password" title="Forgot your password?" subtitle="Enter the email on your account and we'll send a reset link.">
      <form onSubmit={submit}>
        <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="you@company.com" />
        <Btn primary type="submit" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Btn>
      </form>
      <p style={{ textAlign: "center", fontSize: 13.5, color: T.dim, marginTop: 24 }}>
        <Link onClick={() => setScreen("login")}>Back to sign in</Link>
      </p>
    </Shell>
  );
}

function OtpScreen({ email, purpose, setScreen }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const verify = (e) => {
    e.preventDefault();
    if (code.length < 6) { setError("Enter the full 6-digit code."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setScreen(purpose === "reset" ? "reset" : "login");
    }, 600);
  };

  return (
    <Shell eyebrow="Verification code" title="Enter your code" subtitle={`We sent a 6-digit code to ${email || "your email"}.`}>
      <form onSubmit={verify}>
        <Otp value={code} onChange={setCode} />
        {error && <Banner tone="error">{error}</Banner>}
        <div style={{ textAlign: "center", fontFamily: T.fontMono, fontSize: 12.5, color: T.faint, marginBottom: 20 }}>
          {seconds > 0 ? <>Code expires in <b style={{ color: T.accent }}>00:{String(seconds).padStart(2, "0")}</b></> : "Code expired"}
        </div>
        <Btn primary type="submit" disabled={loading}>{loading ? "Verifying…" : "Verify code"}</Btn>
      </form>
      <div style={{ marginTop: 14, textAlign: "center" }}>
        {seconds === 0 ? (
          <Link onClick={() => setSeconds(30)}>Resend code</Link>
        ) : (
          <span style={{ color: T.faint, fontSize: 12.5 }}>Didn't get a code? You can resend once the timer runs out.</span>
        )}
      </div>
      <p style={{ textAlign: "center", fontSize: 13.5, color: T.dim, marginTop: 24 }}>
        <Link onClick={() => setScreen("login")}>Back to sign in</Link>
      </p>
    </Shell>
  );
}

function ResetScreen({ setScreen }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (score(password) < 2) next.password = "Choose a stronger password.";
    if (confirm !== password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 600);
  };

  if (done) {
    return (
      <Shell eyebrow="Success" title="Password updated" subtitle="You can now sign in with your new password.">
        <Btn primary onClick={() => setScreen("login")}>Back to sign in</Btn>
      </Shell>
    );
  }

  return (
    <Shell eyebrow="Reset password" title="Choose a new password" subtitle="Make it something you haven't used before.">
      <form onSubmit={submit}>
        <Field label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder="Create a password" />
        <Strength password={password} />
        <div style={{ marginTop: 16 }}>
          <Field label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} placeholder="Re-enter your password" />
        </div>
        <Btn primary type="submit" disabled={loading}>{loading ? "Updating…" : "Update password"}</Btn>
      </form>
    </Shell>
  );
}

function DashboardScreen({ session, setScreen, setSession, showWarn, secondsLeft, onStay }) {
  return (
    <div style={{ minHeight: 560, background: T.ink, borderRadius: 14, border: `1px solid ${T.borderSoft}`, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: `1px solid ${T.borderSoft}` }}>
        <div style={{ fontFamily: T.fontDisplay, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, color: T.text }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.mint }} />
          Vaultline
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{
            fontFamily: T.fontMono, fontSize: 12, color: showWarn ? T.amber : T.dim,
            border: `1px solid ${showWarn ? T.amber + "66" : T.border}`, padding: "6px 12px", borderRadius: 999,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: showWarn ? T.amber : T.mint }} />
            {showWarn ? "Idle — action needed" : "Session active"}
          </span>
          <button onClick={() => { setSession(null); setScreen("login"); }}
            style={{ padding: "9px 16px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.text, cursor: "pointer", fontSize: 13.5 }}>
            Sign out
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.accent, marginBottom: 10 }}>
            Protected route
          </div>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: 25, marginBottom: 8, color: T.text }}>
            You're signed in, {session?.email}
          </h1>
          <p style={{ color: T.dim, fontSize: 14.5, lineHeight: 1.6 }}>
            Stay idle for ~15s and a timeout warning will appear here — this
            demo speeds up the real 60s/90s thresholds so you can see it live.
          </p>
        </div>
      </main>

      {showWarn && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,16,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 320, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 26, textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${T.amber}`, display: "grid", placeContent: "center", margin: "0 auto 16px", fontFamily: T.fontMono, fontWeight: 600, color: T.amber }}>
              {secondsLeft}
            </div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 18, margin: "0 0 8px", color: T.text }}>Still there?</h2>
            <p style={{ color: T.dim, fontSize: 13.5, lineHeight: 1.55, margin: "0 0 20px" }}>
              You'll be signed out in {secondsLeft}s unless you stay signed in.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={() => { setSession(null); setScreen("login"); }}>Sign out</Btn>
              <Btn primary onClick={onStay}>Stay signed in</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
