"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function Nav({ partnerRole, isAdmin }: { partnerRole: "owner" | "branch_admin" | "staff" | null; isAdmin: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const solid = scrolled || !isHome;

  return (
    <header
      className={`${isHome ? "fixed" : "sticky"} top-0 inset-x-0 z-50 transition-all duration-200 ${
        solid ? "bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${solid ? "bg-brand" : "bg-white"}`} />
          <span className={`font-bold text-xl tracking-tight ${solid ? "text-slate-800" : "text-white"}`}>Waypoint</span>
        </Link>

<nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${solid ? "text-slate-600" : "text-white/90"}`}>
  <Link href="/" className="hover:opacity-70 transition-opacity">Cars</Link>
  <Link href="/" className="hover:opacity-70 transition-opacity">Deals</Link>
  <Link href="/" className="hover:opacity-70 transition-opacity">Help</Link>
</nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              {partnerRole && (
                <Link
                  href="/partner"
                  className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 rounded-full ${
                    solid ? "text-brand bg-brand/10" : "text-white bg-white/15"
                  }`}
                >

                  
                  <span className="sm:hidden">Dashboard</span>
                  <span className="hidden sm:inline">Partner Dashboard</span>
                  <span className="hidden sm:inline text-[10px] uppercase opacity-70 capitalize">{partnerRole.replace("_", " ")}</span>
                </Link>
              )}
                                {isAdmin && (
  <Link href="/admin" className={`text-sm font-medium ${solid ? "text-slate-600" : "text-white/90"} hover:opacity-70 transition-opacity`}>
    Admin
  </Link>
)}
              <Link href="/bookings" className={`text-sm font-medium ${solid ? "text-slate-600" : "text-white/90"} hover:opacity-70 transition-opacity`}>
                My bookings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Log out"
                className={`flex items-center gap-1 text-sm font-medium ${solid ? "text-slate-500" : "text-white/80"} hover:opacity-70 transition-opacity`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`hidden sm:inline text-sm font-medium ${solid ? "text-slate-600" : "text-white/90"} hover:opacity-70 transition-opacity`}>Sign in</Link>
              <Link href="/register" className={`hidden sm:inline text-sm font-medium ${solid ? "text-slate-600" : "text-white/90"} hover:opacity-70 transition-opacity`}>Register</Link>
            </>
          )}
          <Link href="#search" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}