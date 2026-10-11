import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";

// Full-screen animated backdrop shared by sign in, sign up and password reset.
export default function AuthShell({ children }) {
  const reduce = useReducedMotion();
  const drift = (x, y, d) => (reduce ? {} : { animate: { x: [0, x, 0], y: [0, y, 0], scale: [1, 1.12, 1] }, transition: { duration: d, repeat: Infinity, ease: "easeInOut" } });
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-ink text-white flex items-center justify-center px-4 py-20 sm:py-10">
      <motion.div className="absolute -top-40 -left-32 w-[30rem] h-[30rem] rounded-full bg-signal/40 blur-[110px]" {...drift(70, 50, 15)} />
      <motion.div className="absolute -bottom-48 -right-32 w-[32rem] h-[32rem] rounded-full bg-forest/80 blur-[120px]" {...drift(-60, -40, 18)} />
      <motion.div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-brass/25 blur-[100px]" {...drift(-40, 60, 20)} />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 sm:px-6 h-16 z-10">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-white/90 hover:text-white">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-signal/90 shadow-lg shadow-signal/30"><Shield className="w-4 h-4" /></span>
          Tricore
        </Link>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[26rem]"
      >
        <div className="rounded-3xl p-px bg-gradient-to-br from-white/30 via-white/5 to-signal/50 shadow-2xl shadow-black/40">
          <div className="rounded-[calc(1.5rem-1px)] bg-ink/70 backdrop-blur-xl p-6 sm:p-8">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

export const Field = ({ icon: Icon, right, ...props }) => (
  <div className="relative group">
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/40 group-focus-within:text-signal transition-colors pointer-events-none" />
    <input
      {...props}
      className={`w-full bg-white/[0.06] border border-white/10 rounded-xl py-3 pl-11 ${right ? "pr-11" : "pr-4"} text-base text-white placeholder:text-white/35 focus:outline-none focus:border-signal focus:bg-white/[0.09] focus:ring-4 focus:ring-signal/20 transition`}
    />
    {right}
  </div>
);

export const primaryBtn =
  "relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-signal to-[#5b8cff] px-4 py-3 font-semibold text-white shadow-lg shadow-signal/30 hover:shadow-signal/50 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60 disabled:pointer-events-none";
