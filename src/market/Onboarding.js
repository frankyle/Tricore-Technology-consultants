import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, Phone, MapPin, Briefcase, Clock, Building2, Award, Wrench, FileText,
  CheckCircle2, ArrowRight, Loader2, AlertCircle, PartyPopper, Camera, ImagePlus, X,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { mediaUrl, MAX_IMG } from "./ui";

const fld = "w-full border border-line rounded-xl py-3 pl-11 pr-3 bg-white text-base text-slate placeholder:text-slateSoft/70 focus:outline-none focus:border-signal focus:ring-4 focus:ring-signal/15 transition";
const area = "w-full border border-line rounded-xl py-3 pl-11 pr-3 bg-white text-base text-slate placeholder:text-slateSoft/70 focus:outline-none focus:border-signal focus:ring-4 focus:ring-signal/15 transition resize-none";
const cta = "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-signal to-[#5b8cff] px-4 py-3 font-semibold text-white shadow-lg shadow-signal/25 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none";

const Input = ({ icon: Icon, multiline, ...p }) => (
  <div className="relative">
    <Icon className={`absolute left-3.5 ${multiline ? "top-3.5" : "top-1/2 -translate-y-1/2"} w-[18px] h-[18px] text-slateSoft pointer-events-none`} />
    {multiline ? <textarea rows={3} {...p} className={area} /> : <input {...p} className={fld} />}
  </div>
);

const slide = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.25 } };
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
const okImg = (file) => IMG_TYPES.includes(file.type) ? (file.size <= MAX_IMG ? "" : "Images must be under 2 MB.") : "Use JPG, PNG or WebP images.";
const upload = async (userId, file, prefix) => {
  const path = `${userId}/${prefix}-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const up = await supabase.storage.from("portfolio").upload(path, file);
  if (up.error) throw up.error;
  return path;
};

function PhotoPicker({ label, file, onPick }) {
  const url = React.useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  return (
    <label className="flex items-center gap-4 cursor-pointer group">
      <span className="relative grid place-items-center w-20 h-20 rounded-full border-2 border-dashed border-line bg-paper overflow-hidden group-hover:border-signal transition">
        {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <Camera className="w-7 h-7 text-slateSoft" />}
      </span>
      <span className="text-sm"><span className="font-medium block">{label}</span><span className="text-slateSoft">JPG, PNG or WebP, up to 2 MB</span></span>
      <input type="file" accept={IMG_TYPES.join(",")} className="hidden" onChange={(e) => { const x = e.target.files[0]; e.target.value = ""; if (x) onPick(x); }} />
    </label>
  );
}

const list = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

// First-login profile creation: details -> (technicians) skills & certifications -> done.
// Uses only the tables and columns of the original schema.sql.
export default function Onboarding({ onDone, onSkip }) {
  const { user, profile, refreshProfile } = useAuth();
  const role = profile.role;
  const [phase, setPhase] = useState("details"); // details | skills | photos | done
  const [photo, setPhoto] = useState(null);
  const [work, setWork] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [f, setF] = useState({
    full_name: profile.full_name || "", phone: "", city: "", company: "", description: "",
    headline: "", years: "", skills: "", certs: "", bio: "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const steps = role === "technician" ? ["Details", "Skills & certificates", "Work photos", "Done"] : ["Details", "Done"];
  const idx = phase === "details" ? 0 : phase === "skills" ? 1 : phase === "photos" ? 2 : steps.length - 1;
  const fail = (m) => { setBusy(false); setMsg(m); };

  const saveDetails = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg("");
    const name = f.full_name.trim();
    let photoUrl = null;
    if (photo) {
      const bad = okImg(photo);
      if (bad) return fail(bad);
      try { photoUrl = mediaUrl(await upload(user.id, photo, "avatar")); } catch (err) { return fail(err.message); }
    }
    const p = await supabase.from("profiles").update({ full_name: name, phone: f.phone.trim(), ...(photoUrl ? { avatar_url: photoUrl } : {}) }).eq("id", user.id);
    if (p.error) return fail(p.error.message);

    if (role === "technician") {
      const row = {
        display_name: name, headline: f.headline.trim() || null, city: f.city.trim() || null,
        years_experience: f.years === "" ? null : Number(f.years),
      };
      const { data: ex } = await supabase.from("technicians").select("id").eq("id", user.id).maybeSingle();
      const r = ex
        ? await supabase.from("technicians").update(row).eq("id", user.id)
        : await supabase.from("technicians").insert({ ...row, id: user.id });
      if (r.error) return fail(r.error.message);
      // public profile photo (needs the avatar column from 06_reset_profile_setup.sql; ignored if missing)
      if (photoUrl) await supabase.from("technicians").update({ avatar_url: photoUrl }).eq("id", user.id);
      setBusy(false);
      return setPhase("skills");
    }
    if (role === "company") {
      const { data: ex } = await supabase.from("companies").select("id").eq("owner_id", user.id).limit(1).maybeSingle();
      const row = { name: f.company.trim(), city: f.city.trim() || null, description: f.description.trim() || null, ...(photoUrl ? { logo_url: photoUrl } : {}) };
      const r = ex
        ? await supabase.from("companies").update(row).eq("id", ex.id)
        : await supabase.from("companies").insert({ ...row, owner_id: user.id });
      if (r.error) return fail(r.error.message);
    }
    setBusy(false);
    setPhase("done");
  };

  const saveSkills = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg("");
    // Certifications are stored with the skills so they show on your public profile.
    const skills = [...new Set([...list(f.skills), ...list(f.certs)])];
    const r = await supabase.from("technicians").update({ skills, bio: f.bio.trim() || null }).eq("id", user.id);
    if (r.error) return fail(r.error.message);
    setBusy(false);
    setPhase("photos");
  };

  const addWork = (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    for (const x of files) { const bad = okImg(x); if (bad) return setMsg(`${x.name}: ${bad}`); }
    setMsg("");
    setWork((w) => [...w, ...files].slice(0, 8));
  };

  const saveWork = async () => {
    setBusy(true); setMsg("");
    try {
      for (const file of work) {
        const path = await upload(user.id, file, "work");
        const { error } = await supabase.from("portfolio_items").insert({ technician_id: user.id, media_type: "image", storage_path: path });
        if (error) throw error;
      }
    } catch (err) { return fail(err.message); }
    setBusy(false);
    setPhase("done");
  };

  const finish = async () => { await refreshProfile(); onDone(); };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-5 flex items-center gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className="h-1.5 rounded-full bg-line overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-signal to-[#5b8cff]" initial={false} animate={{ width: i <= idx ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
            </div>
            <p className={`mt-1 text-[11px] ${i <= idx ? "text-slate font-medium" : "text-slateSoft"}`}>{s}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-line shadow-xl shadow-ink/5 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-signal via-[#5b8cff] to-brass" />
        <div className="p-5 sm:p-7">
          <AnimatePresence mode="wait" initial={false}>
            {phase === "details" && (
              <motion.form key="details" {...slide} onSubmit={saveDetails} className="space-y-3.5">
                <div>
                  <h1 className="font-display text-2xl font-semibold">Create your profile</h1>
                  <p className="text-sm text-slateSoft">
                    {role === "technician" ? "Tell clients who you are." : role === "company" ? "Tell us about you and your company." : "So technicians know who they're helping."}
                  </p>
                </div>
                <PhotoPicker label={role === "company" ? "Company logo" : "Profile photo"} file={photo} onPick={(x) => { const bad = okImg(x); if (bad) setMsg(bad); else { setMsg(""); setPhoto(x); } }} />
                <Input icon={User} placeholder="Full name" required autoComplete="name" value={f.full_name} onChange={set("full_name")} />
                <Input icon={Phone} type="tel" inputMode="tel" placeholder="Phone / WhatsApp (e.g. +255 7XX XXX XXX)" required autoComplete="tel" value={f.phone} onChange={set("phone")} />
                {role === "company" && (
                  <>
                    <Input icon={Building2} placeholder="Company name" required value={f.company} onChange={set("company")} />
                    <Input icon={FileText} multiline placeholder="What does your company do?" value={f.description} onChange={set("description")} />
                  </>
                )}
                {role !== "requester" && <Input icon={MapPin} placeholder="City" required value={f.city} onChange={set("city")} />}
                {role === "technician" && (
                  <>
                    <Input icon={Briefcase} placeholder="Headline (e.g. CCTV & network installer)" required value={f.headline} onChange={set("headline")} />
                    <Input icon={Clock} type="number" min="0" inputMode="numeric" placeholder="Years of experience" required value={f.years} onChange={set("years")} />
                  </>
                )}
                <p className="text-xs text-slateSoft">Your phone number stays private. It is never shown on your public profile.</p>
                {msg && <p className="flex gap-2 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{msg}</p>}
                <button className={cta} disabled={busy}>
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save & continue <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={onSkip} className="w-full text-sm text-slateSoft hover:text-slate">I'll do this later</button>
              </motion.form>
            )}

            {phase === "skills" && (
              <motion.form key="skills" {...slide} onSubmit={saveSkills} className="space-y-3.5">
                <div>
                  <h1 className="font-display text-2xl font-semibold">Skills & certifications</h1>
                  <p className="text-sm text-slateSoft">Clients search by these, so list what you're good at.</p>
                </div>
                <Input icon={Wrench} placeholder="Skills, separated by commas (CCTV, Networking, Fire alarms)" value={f.skills} onChange={set("skills")} />
                <Input icon={Award} placeholder="Certifications, separated by commas (Hikvision HCSA, CCNA)" value={f.certs} onChange={set("certs")} />
                <Input icon={FileText} multiline placeholder="About you and your work" value={f.bio} onChange={set("bio")} />
                {msg && <p className="flex gap-2 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{msg}</p>}
                <button className={cta} disabled={busy}>
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save & continue <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={() => { setMsg(""); setPhase("done"); }} className="w-full text-sm text-slateSoft hover:text-slate">Skip for now</button>
              </motion.form>
            )}

            {phase === "photos" && (
              <motion.div key="photos" {...slide} className="space-y-3.5">
                <div>
                  <h1 className="font-display text-2xl font-semibold">Show your work</h1>
                  <p className="text-sm text-slateSoft">Add photos of jobs you've done (up to 8). Clients trust profiles with photos.</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {work.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-line">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button type="button" aria-label="Remove" onClick={() => setWork(work.filter((_, j) => j !== i))} className="absolute top-1 right-1 grid place-items-center w-6 h-6 rounded-full bg-ink/70 text-white"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {work.length < 8 && (
                    <label className="aspect-square grid place-items-center rounded-lg border-2 border-dashed border-line text-slateSoft hover:border-signal hover:text-signal cursor-pointer transition">
                      <ImagePlus className="w-7 h-7" />
                      <input type="file" multiple accept={IMG_TYPES.join(",")} className="hidden" onChange={addWork} />
                    </label>
                  )}
                </div>
                {msg && <p className="flex gap-2 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{msg}</p>}
                <button className={cta} disabled={busy || !work.length} onClick={saveWork}>
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Upload & finish <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={() => { setMsg(""); setPhase("done"); }} className="w-full text-sm text-slateSoft hover:text-slate">Skip for now</button>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div key="done" {...slide} className="text-center space-y-4 py-2">
                <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 15 }}
                  className="mx-auto grid place-items-center w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200">
                  <PartyPopper className="w-9 h-9 text-emerald-600" />
                </motion.div>
                <h1 className="font-display text-2xl font-semibold">You're all set</h1>
                {role === "technician" ? (
                  <ul className="text-left text-sm space-y-2 max-w-xs mx-auto">
                    {["Add videos and more work photos on your dashboard", "Check your public page", "Browse open job requests"].map((t) => (
                      <li key={t} className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-signal shrink-0" />{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slateSoft">Your account is ready. You can now {role === "company" ? "manage your company listing and " : ""}send job requests.</p>
                )}
                <button className={cta} onClick={finish}>Go to my dashboard <ArrowRight className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
