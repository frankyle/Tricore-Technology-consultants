import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const ROLES = ["technician", "company", "requester"];

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u) => {
    if (!u) { setProfile(null); setProfileError(""); return; }
    const read = () => supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
    let { data, error } = await read();
    let err = error ? error.message : "";
    if (!data && !error) {
      // No profile row yet: create it from here instead of waiting for the database trigger.
      const meta = u.user_metadata || {};
      const ins = await supabase.from("profiles").insert({
        id: u.id, role: ROLES.includes(meta.role) ? meta.role : "requester", full_name: meta.full_name || null,
      });
      if (ins.error) err = ins.error.message;
      const again = await read();
      data = again.data;
      if (again.error) err = again.error.message;
    }
    setProfileError(data ? "" : err || "Profile row not found.");
    setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user).finally(() => setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // deferred: calling supabase inside this callback can lock the client
      setTimeout(() => loadProfile(s?.user), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(session?.user), [loadProfile, session]);

  return (
    <Ctx.Provider value={{ session, user: session?.user, profile, profileError, loading, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}
