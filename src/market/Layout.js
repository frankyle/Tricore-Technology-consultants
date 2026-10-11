import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function Layout() {
  const { user } = useAuth();
  const nav = useNavigate();
  const l = "hover:text-brassLight";
  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-ink text-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold">
            <Shield className="w-5 h-5" /> Tricore
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className={l} to="/technicians">Technicians</Link>
            <Link className={l} to="/companies">Companies</Link>
            <Link className={l} to="/jobs">Jobs</Link>
            {user ? (
              <>
                <Link className={l} to="/dashboard">Dashboard</Link>
                <button className={l} onClick={async () => { await supabase.auth.signOut(); nav("/technicians"); }}>
                  Sign out
                </button>
              </>
            ) : (
              <Link className="bg-signal px-3 py-1.5 rounded-lg" to="/login">Sign in</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8"><Outlet /></main>
    </div>
  );
}
