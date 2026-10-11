import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowUpRight,
  Home,
  BriefcaseBusiness,
  Grid2X2,
  Info,
  Mail,
  Users,
  FolderOpen,
  Briefcase,
  LogIn,
  LayoutGrid,
  X,
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "#home", icon: Home },
  { name: "Services", href: "#services", icon: BriefcaseBusiness },
  { name: "Solutions", href: "#solutions", icon: Grid2X2 },
  { name: "About", href: "#about", icon: Info },
  { name: "Projects", href: "#portfolio", icon: FolderOpen },
  { name: "Careers", href: "#careers", icon: Briefcase },
  { name: "Technicians", href: "/technicians", icon: Users },
  { name: "Contact", href: "#contact", icon: Mail },
  { name: "Sign in", href: "/login", icon: LogIn },
];


const Header = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    setMore(false);
    if (id.startsWith("/")) return navigate(id);
    const el = document.querySelector(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <>
      {/* =========================
          MAIN HEADER
      ========================== */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-ink/95 backdrop-blur-xl shadow-2xl"
            : "bg-ink/75 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4 md:px-10">
          <div className="flex justify-between items-center h-[72px] md:h-16">
            
            {/* =========================
                LOGO / COMPANY NAME
            ========================== */}
            <motion.button
              onClick={() => handleScrollTo("#home")}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 text-left group"
            >
              {/* Shield Logo */}
              <motion.div
                whileHover={{ rotate: 12, scale: 1.08 }}
                className="relative flex-shrink-0"
              >
                <div className="absolute inset-0 bg-signal blur-lg opacity-40 rounded-full" />

                <div className="relative w-11 h-11 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-signal to-signalDark flex items-center justify-center shadow-lg border border-white/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </motion.div>

              {/* Brand Name */}
              <div className="leading-none">
                <div className="flex items-center gap-2">
                  <span className="text-white font-extrabold text-[17px] sm:text-lg md:text-xl tracking-[0.08em]">
                    TRICORE
                  </span>

                  <span className="hidden sm:block w-6 h-[2px] bg-signal rounded-full" />
                </div>

                <span className="block mt-1 text-[8px] sm:text-[9px] md:text-xs text-white/55 font-semibold tracking-[0.18em] uppercase">
                  Technology Solutions
                </span>
              </div>
            </motion.button>

            {/* =========================
                GET A QUOTE CTA
            ========================== */}
            <motion.button
              onClick={() => handleScrollTo("#contact")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className="
                group relative overflow-hidden
                flex items-center gap-2
                bg-signal hover:bg-signalDark
                text-white
                px-3 py-2 md:px-5 md:py-2
                rounded-2xl md:rounded-xl
                shadow-lg shadow-black/20
                transition-all duration-300
              "
            >
              {/* Animated shine */}
              <span className="absolute inset-0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <span className="relative hidden sm:inline text-sm md:text-base font-bold">
                Get a Quote
              </span>

              {/* Mobile version */}
              <span className="relative sm:hidden text-xs font-bold">
                Quote
              </span>

              <motion.span
                className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/15"
                animate={{ x: [0, 2, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <ArrowUpRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </div>
        </div>

        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}
        <div
          className={`hidden md:flex justify-center items-center gap-8 py-3 transition-all duration-500 ${
            scrolled
              ? "bg-forestDark/70 backdrop-blur-xl border-t border-white/10"
              : "bg-transparent"
          }`}
        >
          {navLinks.map((link) => (
            <motion.button
              key={link.name}
              onClick={() => handleScrollTo(link.href)}
              whileHover={{ y: -2 }}
              className="
                relative text-white/70 hover:text-white
                font-medium transition-colors duration-200
                after:absolute after:left-0 after:-bottom-1
                after:w-0 after:h-[2px]
                after:bg-signal
                after:transition-all after:duration-300
                hover:after:w-full
              "
            >
              {link.name}
            </motion.button>
          ))}
        </div>
      </header>

      {/* =========================
          MOBILE "MORE" SHEET (all links)
      ========================== */}
      <AnimatePresence>
        {more && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMore(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              key="sheet"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="fixed left-3 right-3 bottom-28 z-50 md:hidden rounded-3xl bg-ink/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-white font-semibold">Menu</span>
                <button onClick={() => setMore(false)} aria-label="Close menu" className="w-8 h-8 grid place-items-center rounded-full bg-white/10 text-white/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.name}
                      onClick={() => handleScrollTo(link.href)}
                      className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/[0.06] hover:bg-white/10 active:scale-95 transition py-3 text-white/80"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px] font-medium">{link.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =========================
          MOBILE BOTTOM NAVIGATION
      ========================== */}
      <motion.nav
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="
          fixed bottom-3 left-3 right-3 z-50 md:hidden
          bg-ink/90 backdrop-blur-2xl
          border border-white/10
          rounded-3xl
          shadow-2xl
        "
      >
        <div className="flex items-center justify-around px-2 py-2">
          {[navLinks[0], navLinks[1]].map((link) => {
            const Icon = link.icon;
            return (
              <motion.button
                key={link.name}
                onClick={() => handleScrollTo(link.href)}
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center justify-center gap-1 min-w-[54px] py-1.5 rounded-2xl text-white/60 hover:text-white transition-all duration-300"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-xl"><Icon className="w-4 h-4" /></div>
                <span className="text-[9px] font-medium">{link.name}</span>
              </motion.button>
            );
          })}

          {/* Contact highlight (centre) */}
          <motion.button
            onClick={() => handleScrollTo("#contact")}
            whileTap={{ scale: 0.88 }}
            className="flex flex-col items-center justify-center gap-1 min-w-[54px] py-1.5 rounded-2xl text-signal"
          >
            <div className="w-9 h-9 -mt-5 rounded-2xl bg-signal text-white flex items-center justify-center shadow-lg border-4 border-ink">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold">Contact</span>
          </motion.button>

          {navLinks.filter((l) => l.name === "Technicians").map((link) => {
            const Icon = link.icon;
            return (
              <motion.button
                key={link.name}
                onClick={() => handleScrollTo(link.href)}
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center justify-center gap-1 min-w-[54px] py-1.5 rounded-2xl text-white/60 hover:text-white transition-all duration-300"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-xl"><Icon className="w-4 h-4" /></div>
                <span className="text-[9px] font-medium">{link.name}</span>
              </motion.button>
            );
          })}

          {/* More: opens every link */}
          <motion.button
            onClick={() => setMore(!more)}
            whileTap={{ scale: 0.85 }}
            aria-label="More links"
            aria-expanded={more}
            className={`flex flex-col items-center justify-center gap-1 min-w-[54px] py-1.5 rounded-2xl transition-all duration-300 ${more ? "text-white" : "text-white/60 hover:text-white"}`}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl ${more ? "bg-white/15" : ""}`}>
              {more ? <X className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </div>
            <span className="text-[9px] font-medium">More</span>
          </motion.button>
        </div>
      </motion.nav>
    </>
  );
};

export default Header;