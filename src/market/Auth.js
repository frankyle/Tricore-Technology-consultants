import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Wrench, Building2, Search, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { supabase } from "../supabaseClient";
import AuthShell, { Field, primaryBtn } from "./AuthShell";

const ROLES = [
  ["technician", "Technician", Wrench],
  ["company", "Company", Building2],
  ["requester", "I need help", Search],
];

const COPY = {
  login: ["Welcome back", "Sign in to your Tricore account."],
  signup: ["Create your account", "Join Tricore in under a minute."],
  forgot: ["Forgot password?", "Enter your email and we'll send you a reset link."],
};

const strength = (p) => {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

const slide = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25 },
};

export default function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup | forgot | sent | confirm
  const [f, setF] = useState({ email: "", password: "", full_name: "", role: "technician" });
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const go = (m) => { setMode(m); setMsg(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const email = f.email.trim();
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        return setMode("sent");
      }
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: f.password });
        if (error) throw error;
        return nav("/dashboard");
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password: f.password,
        options: { data: { role: f.role, full_name: f.full_name.trim() } },
      });
      if (error) throw error;
      // Supabase returns a user with no identities when the email already exists.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return setMsg({ type: "error", text: "This email is already registered. Sign in, or tap “Forgot password?” to reset it." });
      }
      if (data.session) return nav("/dashboard");
      setMode("confirm");
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const isDone = mode === "sent" || mode === "confirm";
  const score = strength(f.password);

  return (
    <AuthShell>
      <AnimatePresence mode="wait" initial={false}>
        {isDone ? (
          <motion.div key="done" {...slide} className="text-center py-4">
            <motion.div
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
              className="mx-auto mb-5 grid place-items-center w-20 h-20 rounded-full bg-signal/15 border border-signal/40 shadow-[0_0_40px_rgba(47,111,237,.35)]"
            >
              <MailCheck className="w-9 h-9 text-signal" />
            </motion.div>
            <h1 className="font-display text-2xl font-semibold">Check your email</h1>
            <p className="mt-2 text-sm text-white/60">
              {mode === "sent"
                ? <>We sent a password reset link to <span className="text-white">{f.email}</span>. It may take a minute; check spam too.</>
                : <>We sent a confirmation link to <span className="text-white">{f.email}</span>. Open it, then sign in.</>}
            </p>
            <button type="button" onClick={() => go("login")} className="mt-6 text-sm text-signal hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" {...slide}>
            {mode !== "forgot" && (
              <div className="relative grid grid-cols-2 p-1 mb-6 rounded-xl bg-white/[0.06] border border-white/10">
                {["login", "signup"].map((m) => (
                  <button key={m} type="button" onClick={() => go(m)} className={`relative z-10 py-2 text-sm font-medium rounded-lg transition-colors ${mode === m ? "text-white" : "text-white/55 hover:text-white/80"}`}>
                    {mode === m && <motion.span layoutId="authTab" className="absolute inset-0 -z-10 rounded-lg bg-signal shadow-lg shadow-signal/30" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    {m === "login" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mode + "-head"} {...slide} className="mb-5">
                <h1 className="font-display text-2xl sm:text-[1.7rem] font-semibold tracking-tight">{COPY[mode][0]}</h1>
                <p className="mt-1 text-sm text-white/55">{COPY[mode][1]}</p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={submit} className="space-y-3.5">
              <AnimatePresence initial={false}>
                {mode === "signup" && (
                  <motion.div key="signup-extra" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3.5 overflow-hidden">
                    <Field icon={User} placeholder="Full name" autoComplete="name" required value={f.full_name} onChange={set("full_name")} />
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map(([value, label, Icon]) => (
                        <button key={value} type="button" onClick={() => setF({ ...f, role: value })}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-3 text-xs font-medium transition ${f.role === value ? "border-signal bg-signal/15 text-white shadow-[0_0_20px_rgba(47,111,237,.25)]" : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"}`}>
                          <Icon className="w-5 h-5" /> {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Field icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="Email address" required value={f.email} onChange={set("email")} />

              {mode !== "forgot" && (
                <div>
                  <Field
                    icon={Lock} type={show ? "text" : "password"} placeholder="Password (min 6 characters)" required minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"} value={f.password} onChange={set("password")}
                    right={
                      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition">
                        {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                      </button>
                    }
                  />
                  {mode === "signup" && f.password && (
                    <div className="mt-2 flex gap-1.5" aria-hidden="true">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.span key={i} animate={{ opacity: score >= i ? 1 : 0.2 }} className={`h-1 flex-1 rounded-full ${score <= 1 ? "bg-red-400" : score === 2 ? "bg-amber-400" : "bg-emerald-400"}`} />
                      ))}
                    </div>
                  )}
                  {mode === "login" && (
                    <div className="mt-2 text-right">
                      <button type="button" onClick={() => go("forgot")} className="text-sm text-signal hover:underline">Forgot password?</button>
                    </div>
                  )}
                </div>
              )}

              <AnimatePresence>
                {msg && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {msg.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <button className={primaryBtn} disabled={busy}>
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>{mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {mode === "forgot" && (
              <button type="button" onClick={() => go("login")} className="mt-5 text-sm text-white/60 hover:text-white inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
