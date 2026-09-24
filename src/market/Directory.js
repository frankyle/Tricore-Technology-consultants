import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";
import { inp, card, mediaUrl } from "./ui";
import { JobForm } from "./Jobs";

const Verified = () => <BadgeCheck className="inline w-4 h-4 text-signal ml-1" />;

export function Technicians() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("technicians")
      .select("*, portfolio_items(storage_path, media_type)")
      .eq("is_public", true)
      .order("verified", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  }, []);

  const term = q.toLowerCase();
  const list = rows.filter((t) =>
    [t.display_name, t.headline, t.city, ...(t.skills || [])].join(" ").toLowerCase().includes(term));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-4">Find a technician</h1>
      <input className={inp + " mb-6"} placeholder="Search by name, skill or city (CCTV, networking, Dar es Salaam…)"
        value={q} onChange={(e) => setQ(e.target.value)} />
      {loading ? <p>Loading…</p> : !list.length ? <p className="text-slateSoft">No technicians found yet.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((t) => {
            const img = t.portfolio_items?.find((p) => p.media_type === "image");
            return (
              <Link key={t.id} to={`/technicians/${t.id}`} className={card + " block hover:shadow-md"}>
                {img && <img src={mediaUrl(img.storage_path)} alt="" loading="lazy" className="w-full h-40 object-cover rounded-lg mb-3" />}
                <h3 className="font-semibold">{t.display_name}{t.verified && <Verified />}</h3>
                <p className="text-sm text-slateSoft">{t.headline}</p>
                {t.city && <p className="text-xs mt-1"><MapPin className="inline w-3 h-3" /> {t.city}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(t.skills || []).slice(0, 4).map((k) => (
                    <span key={k} className="text-xs bg-paper border border-line rounded px-2 py-0.5">{k}</span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TechnicianDetail() {
  const { id } = useParams();
  const [t, setT] = useState(undefined);

  useEffect(() => {
    supabase.from("technicians").select("*, portfolio_items(*)").eq("id", id).maybeSingle()
      .then(({ data }) => setT(data));
  }, [id]);

  if (t === undefined) return <p>Loading…</p>;
  if (!t) return <p>Technician not found.</p>;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className={card}>
          <h1 className="font-display text-3xl font-semibold">{t.display_name}{t.verified && <Verified />}</h1>
          <p className="text-slateSoft">{t.headline}</p>
          <p className="text-sm mt-2">
            {t.city}{t.years_experience != null && ` · ${t.years_experience} yrs experience`}
          </p>
          {t.bio && <p className="mt-3 whitespace-pre-line">{t.bio}</p>}
          <div className="flex flex-wrap gap-1 mt-3">
            {(t.skills || []).map((k) => <span key={k} className="text-xs bg-paper border border-line rounded px-2 py-0.5">{k}</span>)}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {(t.portfolio_items || []).map((p) => (
            <div key={p.id} className={card}>
              {p.media_type === "video"
                ? <video src={mediaUrl(p.storage_path)} controls preload="metadata" className="w-full rounded-lg" />
                : <img src={mediaUrl(p.storage_path)} alt={p.title || ""} loading="lazy" className="w-full rounded-lg" />}
              {p.title && <p className="text-sm mt-2">{p.title}</p>}
            </div>
          ))}
        </div>
      </div>
      <div className={card + " h-fit"}>
        <h2 className="font-semibold mb-3">Request {t.display_name.split(" ")[0]}</h2>
        <JobForm technicianId={t.id} />
      </div>
    </div>
  );
}

export function Companies() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    supabase.from("companies").select("*").order("verified", { ascending: false })
      .then(({ data }) => setRows(data || []));
  }, []);
  if (!rows) return <p>Loading…</p>;
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-4">Companies</h1>
      {!rows.length ? <p className="text-slateSoft">No companies registered yet.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((c) => (
            <div key={c.id} className={card}>
              <h3 className="font-semibold">{c.name}{c.verified && <Verified />}</h3>
              {c.city && <p className="text-xs text-slateSoft">{c.city}</p>}
              <p className="text-sm mt-2">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
