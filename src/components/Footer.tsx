import { ExternalLink } from 'lucide-react';
import { LINKEDIN_URL, LOGO_SRC } from '../constants';

export function Footer() {
  return (
    <footer className="bg-[#0b192c] text-slate-400 border-t border-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <a
              href="#hero"
              aria-label="VIA Inicio"
              className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b493] rounded"
            >
              <img
                src={LOGO_SRC}
                alt="VIA Logo"
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain invert hue-rotate-180 brightness-110 mix-blend-screen"
              />
            </a>
            <div className="sm:border-l sm:border-slate-700/80 sm:pl-4 text-xs font-mono">
              <p className="text-slate-200 font-semibold">Si se mueve, lo contamos.</p>
              <p className="text-slate-400 mt-0.5">Bogotá, Colombia</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-200 hover:text-[#00d2aa] inline-flex items-center gap-1.5 transition-colors font-semibold"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <span className="text-slate-500">© 2026 VIA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
