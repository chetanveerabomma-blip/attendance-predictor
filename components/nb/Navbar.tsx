"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { NBButton } from "./NBButton";
import { Menu, X, ShieldAlert, User, LogOut, LayoutDashboard } from "lucide-react";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [staticUser, setStaticUser] = useState<{ name?: string; role?: string; regNo?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("attendance_user_session");
      if (stored) setStaticUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const currentUser = session?.user || staticUser;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("attendance_user_session");
    }
    setStaticUser(null);
    if (session) {
      signOut({ callbackUrl: "/" });
    } else {
      window.location.href = "./";
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b-[3px] border-nb-ink shadow-[0_4px_0_#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-nb-yellow border-[3px] border-nb-ink shadow-[3px_3px_0px_#0A0A0A] flex items-center justify-center font-heading font-black text-lg text-nb-ink group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              AP
            </div>
            <div>
              <div className="font-heading font-black text-sm tracking-wider uppercase text-nb-ink leading-tight">
                ATTENDANCE PREDICTOR
              </div>
              <div className="font-mono text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                SRM TRICHY • EEE DEPT
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#how-it-works"
              className="font-heading uppercase font-bold text-xs tracking-wider text-nb-ink hover:text-nb-blue transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#sections"
              className="font-heading uppercase font-bold text-xs tracking-wider text-nb-ink hover:text-nb-blue transition-colors"
            >
              Sections
            </Link>
            <Link
              href="/#faq"
              className="font-heading uppercase font-bold text-xs tracking-wider text-nb-ink hover:text-nb-blue transition-colors"
            >
              FAQ
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <NBButton size="sm" variant="primary">
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    Dashboard
                  </NBButton>
                </Link>

                <Link href="/profile">
                  <NBButton size="sm" variant="outline">
                    <User className="w-4 h-4 mr-1.5" />
                    Profile
                  </NBButton>
                </Link>

                {(currentUser as any).role === "ADMIN" && (
                  <Link href="/admin">
                    <NBButton size="sm" variant="purple">
                      <ShieldAlert className="w-4 h-4 mr-1.5" />
                      Admin
                    </NBButton>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="font-mono text-xs font-bold text-nb-red hover:underline p-1 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <NBButton size="sm" variant="outline">
                    Sign In
                  </NBButton>
                </Link>
                <Link href="/register">
                  <NBButton size="sm" variant="primary">
                    Register
                  </NBButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            {currentUser && (
              <Link href="/dashboard">
                <NBButton size="sm" variant="primary">
                  Calc
                </NBButton>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 border-[2px] border-nb-ink bg-white shadow-[2px_2px_0px_#0A0A0A]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-nb-bg border-t-[3px] border-nb-ink p-4 space-y-3">
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-heading uppercase font-black text-sm tracking-wider py-1 text-nb-ink"
          >
            How It Works
          </Link>
          <Link
            href="/#sections"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-heading uppercase font-black text-sm tracking-wider py-1 text-nb-ink"
          >
            Sections
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-heading uppercase font-black text-sm tracking-wider py-1 text-nb-ink"
          >
            FAQ
          </Link>

          <div className="pt-2 border-t-[2px] border-nb-ink flex flex-col gap-2">
            {session?.user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <NBButton size="sm" variant="primary" className="w-full">
                    Dashboard Calculator
                  </NBButton>
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <NBButton size="sm" variant="outline" className="w-full">
                    Student Profile
                  </NBButton>
                </Link>
                {(session.user as any).role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <NBButton size="sm" variant="purple" className="w-full">
                      Admin Portal
                    </NBButton>
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="font-mono text-xs font-bold text-nb-red py-2 text-center"
                >
                  Logout ({(session.user as any).regNo})
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <NBButton size="sm" variant="outline" className="w-full">
                    Student Login
                  </NBButton>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <NBButton size="sm" variant="primary" className="w-full">
                    Register New Account
                  </NBButton>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
