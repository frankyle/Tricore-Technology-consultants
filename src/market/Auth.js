import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { inp, btn, card } from "./ui";

export default function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ email: "", password: "", full_name: "", role: "technician" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const r =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
        : await supabase.auth.signUp({
            email: f.email,
            password: f.password,
            options: { data: { role: f.role, full_name: f.full_name } },
          });
    setBusy(false);
    if (r.error) return setMsg(r.error.message);
    if (r.data.session) nav("/dashboard");
    else setMsg("Check your email to confirm your account, then sign in.");
  };

  return (
    <form onSubmit={submit} className={card + " max-w-md mx-auto space-y-3"}>
      <h1 className="font-display text-2xl font-semibold">{mode === "login" ? "Sign in" : "Create account"}</h1>
      {mode === "signup" && (
        <>
          <input className={inp} placeholder="Full name" required value={f.full_name} onChange={set("full_name")} />
          <select className={inp} value={f.role} onChange={set("role")}>
            <option value="technician">I'm a technician</option>
            <option value="company">I'm a company</option>
            <option value="requester">I need a technician</option>
          </select>
        </>
      )}
      <input className={inp} type="email" placeholder="Email" required value={f.email} onChange={set("email")} />
      <input className={inp} type="password" placeholder="Password (min 6 characters)" required minLength={6} value={f.password} onChange={set("password")} />
      {msg && <p className="text-sm text-signalDark">{msg}</p>}
      <button className={btn + " w-full"} disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}</button>
      <button type="button" className="text-sm text-signal underline" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(""); }}>
        {mode === "login" ? "New here? Create an account" : "Already registered? Sign in"}
      </button>
    </form>
  );
}
