import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "../supabaseClient";
import AuthShell, { Field, primaryBtn } from "./AuthShell";

export default function ResetPassword() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  // The emailed link signs the user in with a short "recovery" session.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && s)) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    const t = setTimeout(() => setExpired(true), 5000);
    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");
    if (pw !== pw2) return setErr("The two passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr(error.message);
    setDone(true);
    setTimeout(() => nav("/dashboard"), 1800);
  };

  const eye = (
    <button type="button" onClick={() => setShow(!show)} aria-label="Toggle password visibility" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition">
      {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
    </button>
  );

  return (
    <AuthShell>
      {done ? (
        <div className="text-center py-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="mx-auto mb-5 grid place-items-center w-20 h-20 rounded-full bg-emerald-400/15 border border-emerald-400/40">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </motion.div>
          <h1 className="font-display text-2xl font-semibold">Password updated</h1>
          <p className="mt-2 text-sm text-white/60">Taking you to your dashboard…</p>
        </div>
      ) : !ready ? (
        <div className="text-center py-4">
          {expired ? (
            <>
              <AlertCircle className="w-10 h-10 mx-auto text-amber-300 mb-3" />
              <h1 className="font-display text-xl font-semibold">This reset link has expired</h1>
              <p className="mt-2 text-sm text-white/60">Reset links work once and expire quickly. Request a fresh one.</p>
              <button onClick={() => nav("/login")} className={primaryBtn + " mt-6"}>Back to sign in</button>
            </>
          ) : (
            <>
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-signal" />
              <p className="mt-3 text-sm text-white/60">Verifying your link…</p>
            </>
          )}
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-1 mb-5 text-sm text-white/55">Choose something you'll remember.</p>
          <form onSubmit={submit} className="space-y-3.5">
            <Field icon={Lock} type={show ? "text" : "password"} placeholder="New password" autoComplete="new-password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} right={eye} />
            <Field icon={Lock} type={show ? "text" : "password"} placeholder="Confirm new password" autoComplete="new-password" required minLength={6} value={pw2} onChange={(e) => setPw2(e.target.value)} />
            {err && (
              <p className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {err}
              </p>
            )}
            <button className={primaryBtn} disabled={busy}>
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Update password <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
