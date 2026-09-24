import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { inp, btn, card, mediaUrl, MAX_IMG, MAX_VID } from "./ui";
import { JobForm, JobList } from "./Jobs";

function TechnicianPanel({ user, profile }) {
  const [t, setT] = useState(null);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [f, setF] = useState({
    display_name: profile.full_name || "", headline: "", bio: "", skills: "",
    city: "", years_experience: "", is_public: true,
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = async () => {
    const { data } = await supabase.from("technicians").select("*").eq("id", user.id).maybeSingle();
    if (data) {
      setT(data);
      setF({ ...data, skills: (data.skills || []).join(", "), years_experience: data.years_experience ?? "" });
    }
    const { data: p } = await supabase.from("portfolio_items").select("*")
      .eq("technician_id", user.id).order("created_at", { ascending: false });
    setItems(p || []);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const row = {
      display_name: f.display_name, headline: f.headline, bio: f.bio, city: f.city, is_public: f.is_public,
      skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
      years_experience: f.years_experience === "" ? null : Number(f.years_experience),
    };
    const { error } = t
      ? await supabase.from("technicians").update(row).eq("id", user.id)
      : await supabase.from("technicians").insert({ ...row, id: user.id });
    setMsg(error ? error.message : "Profile saved.");
    load();
  };

  const upload = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const isVid = file.type === "video/mp4";
    const isImg = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!isVid && !isImg) return setMsg("Use JPG, PNG, WebP or MP4 files.");
    if (isImg && file.size > MAX_IMG) return setMsg("Images must be under 2 MB.");
    if (isVid && file.size > MAX_VID) return setMsg("Videos must be under 50 MB.");
    setMsg("Uploading…");
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const up = await supabase.storage.from("portfolio").upload(path, file);
    if (up.error) return setMsg(up.error.message);
    const { error } = await supabase.from("portfolio_items").insert({
      technician_id: user.id, media_type: isVid ? "video" : "image", storage_path: path, title: title || null,
    });
    setMsg(error ? error.message : "Uploaded.");
    setTitle("");
    load();
  };

  const remove = async (p) => {
    await supabase.storage.from("portfolio").remove([p.storage_path]);
    await supabase.from("portfolio_items").delete().eq("id", p.id);
    load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className={card + " space-y-3"}>
        <h2 className="font-semibold text-lg">Your technician profile</h2>
        <input className={inp} placeholder="Display name" required value={f.display_name} onChange={set("display_name")} />
        <input className={inp} placeholder="Headline (e.g. CCTV & network installer)" value={f.headline} onChange={set("headline")} />
        <textarea className={inp} rows={4} placeholder="About you and your work" value={f.bio} onChange={set("bio")} />
        <input className={inp} placeholder="Skills, separated by commas" value={f.skills} onChange={set("skills")} />
        <div className="grid grid-cols-2 gap-3">
          <input className={inp} placeholder="City" value={f.city} onChange={set("city")} />
          <input className={inp} type="number" min="0" placeholder="Years of experience" value={f.years_experience} onChange={set("years_experience")} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.is_public} onChange={(e) => setF({ ...f, is_public: e.target.checked })} />
          Show my profile publicly
        </label>
        <button className={btn}>Save profile</button>
        {t && <Link className="ml-3 text-sm text-signal underline" to={`/technicians/${user.id}`}>View public page</Link>}
      </form>

      <div className={card + " space-y-3"}>
        <h2 className="font-semibold text-lg">Your work (photos and videos)</h2>
        {!t ? <p className="text-sm text-slateSoft">Save your profile first, then add your work.</p> : (
          <>
            <input className={inp} placeholder="Caption for the next upload (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4" onChange={upload} className="text-sm" />
            <p className="text-xs text-slateSoft">JPG, PNG or WebP up to 2 MB. MP4 video up to 50 MB.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((p) => (
                <div key={p.id} className="border border-line rounded-lg p-2">
                  {p.media_type === "video"
                    ? <video src={mediaUrl(p.storage_path)} controls preload="metadata" className="w-full rounded" />
                    : <img src={mediaUrl(p.storage_path)} alt="" className="w-full rounded" />}
                  <div className="flex justify-between text-sm mt-1">
                    <span>{p.title}</span>
                    <button className="text-red-600" onClick={() => remove(p)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {msg && <p className="text-sm text-signalDark">{msg}</p>}
    </div>
  );
}

function CompanyPanel({ user }) {
  const [c, setC] = useState(null);
  const [f, setF] = useState({ name: "", description: "", city: "" });
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = async () => {
    const { data } = await supabase.from("companies").select("*").eq("owner_id", user.id).limit(1).maybeSingle();
    if (data) { setC(data); setF({ name: data.name, description: data.description || "", city: data.city || "" }); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const { error } = c
      ? await supabase.from("companies").update(f).eq("id", c.id)
      : await supabase.from("companies").insert({ ...f, owner_id: user.id });
    setMsg(error ? error.message : "Company saved.");
    load();
  };

  return (
    <form onSubmit={save} className={card + " space-y-3"}>
      <h2 className="font-semibold text-lg">Your company</h2>
      <input className={inp} placeholder="Company name" required value={f.name} onChange={set("name")} />
      <textarea className={inp} rows={3} placeholder="What does your company do?" value={f.description} onChange={set("description")} />
      <input className={inp} placeholder="City" value={f.city} onChange={set("city")} />
      {msg && <p className="text-sm text-signalDark">{msg}</p>}
      <button className={btn}>Save company</button>
    </form>
  );
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [key, setKey] = useState(0);

  if (loading) return <p>Loading…</p>;
  if (!user) return <p><Link className="text-signal underline" to="/login">Sign in</Link> to open your dashboard.</p>;
  if (!profile) return <p>Setting up your account… refresh in a moment.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Welcome{profile.full_name ? `, ${profile.full_name}` : ""}</h1>
        <p className="text-slateSoft capitalize">{profile.role} account</p>
      </div>
      {profile.role === "technician" && (
        <>
          <TechnicianPanel user={user} profile={profile} />
          <p><Link className="text-signal underline" to="/jobs">Browse open job requests →</Link></p>
        </>
      )}
      {profile.role === "company" && (
        <>
          <CompanyPanel user={user} />
          <p><Link className="text-signal underline" to="/jobs">Browse open job requests →</Link></p>
        </>
      )}
      {profile.role !== "technician" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className={card}>
            <h2 className="font-semibold text-lg mb-3">Request a technician</h2>
            <JobForm onDone={() => setKey(key + 1)} />
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-3">My requests</h2>
            <JobList mine refreshKey={key} />
          </div>
        </div>
      )}
    </div>
  );
}
