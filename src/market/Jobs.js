import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { inp, btn, card } from "./ui";

const empty = { title: "", description: "", city: "", contact: "" };

export function JobForm({ technicianId = null, onDone }) {
  const { user } = useAuth();
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (!user)
    return <p><Link className="text-signal underline" to="/login">Sign in</Link> to send a request.</p>;

  const submit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("job_requests").insert({ ...f, requester_id: user.id, technician_id: technicianId });
    if (error) return setMsg(error.message);
    setF(empty);
    setMsg("Request sent.");
    onDone && onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className={inp} placeholder="What do you need? (e.g. Install 8 CCTV cameras)" required value={f.title} onChange={set("title")} />
      <textarea className={inp} rows={3} placeholder="Details" value={f.description} onChange={set("description")} />
      <input className={inp} placeholder="City / location" value={f.city} onChange={set("city")} />
      <input className={inp} placeholder="Your phone or WhatsApp (shown to technicians)" required value={f.contact} onChange={set("contact")} />
      {msg && <p className="text-sm text-signalDark">{msg}</p>}
      <button className={btn}>Send request</button>
    </form>
  );
}

export function JobList({ mine = false, refreshKey = 0 }) {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);

  const load = async () => {
    let q = supabase.from("job_requests").select("*").order("created_at", { ascending: false });
    if (mine) q = q.eq("requester_id", user.id);
    const { data } = await q;
    setRows(data || []);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) load(); }, [user, refreshKey]);

  if (!user) return <p><Link className="text-signal underline" to="/login">Sign in</Link> to see job requests.</p>;
  if (!rows) return <p>Loading…</p>;
  if (!rows.length) return <p className="text-slateSoft">No requests yet.</p>;

  return (
    <div className="space-y-3">
      {rows.map((j) => (
        <div key={j.id} className={card}>
          <div className="flex justify-between gap-2">
            <h3 className="font-semibold">{j.title}</h3>
            <span className="text-xs uppercase bg-paper border border-line rounded px-2 py-0.5 h-fit">{j.status}</span>
          </div>
          {j.description && <p className="text-sm mt-1">{j.description}</p>}
          <p className="text-xs text-slateSoft mt-2">
            {j.city && <>{j.city} · </>}Contact: {j.contact} · {new Date(j.created_at).toLocaleDateString()}
          </p>
          {mine && j.status !== "closed" && (
            <button className="text-sm text-signal underline mt-2"
              onClick={async () => { await supabase.from("job_requests").update({ status: "closed" }).eq("id", j.id); load(); }}>
              Mark as closed
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Jobs() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-1">Job requests</h1>
      <p className="text-slateSoft mb-4">Open requests and requests sent to you.</p>
      <JobList />
    </div>
  );
}
