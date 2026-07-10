import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 sm:grid-cols-4 gap-10">
        <div className="col-span-2 sm:col-span-1">
          <span className="text-white font-bold text-xl">Waypoint</span>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            Book cars from trusted local rental companies across Pakistan.
          </p>
        </div>

        <div>
          <p className="text-white font-semibold text-sm mb-4">Company</p>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">About</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold text-sm mb-4">Legal</p>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold text-sm mb-4">Stay updated</p>
          <p className="text-sm text-slate-400 mb-3">Get the best deals in your inbox.</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm text-white placeholder:text-slate-500 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
            <button type="button" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shrink-0">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Waypoint. All rights reserved.
        </div>
      </div>
    </footer>
  );
}