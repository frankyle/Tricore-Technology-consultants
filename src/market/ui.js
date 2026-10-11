import { supabase } from "../supabaseClient";

export const mediaUrl = (p) => supabase.storage.from("portfolio").getPublicUrl(p).data.publicUrl;
export const inp = "w-full border border-line rounded-lg px-3 py-2 bg-white text-slate focus:outline-none focus:ring-2 focus:ring-signal";
export const btn = "bg-signal hover:bg-signalDark text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50";
export const card = "bg-card border border-line rounded-xl p-4";
export const MAX_IMG = 2 * 1024 * 1024;   // 2 MB
export const MAX_VID = 50 * 1024 * 1024;  // 50 MB
