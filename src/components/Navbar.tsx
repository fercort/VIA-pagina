import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { LOGO_SRC } from '../constants';

const NAV_LINKS = [
  { label: 'El Problema', href: '#problema' },
  { label: 'Cómo Funciona', href: '#como-funciona' },
  { label: 'Demo y Cotizador', href: '#simulador' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Clean VIA Logo only */}
          <a
            href="#hero"
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b493] rounded"
            aria-label="VIA Inicio"
          >
            <img
              src={LOGO_SRC}
              alt="VIA Logo"
              referrerPolicy="no-referrer"
              className="h-11 sm:h-12 w-auto object-contain mix-blend-multiply"
            />
          </a>

          {/* Zone 2: 3 Clean Single-Line Nav Links */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap shrink-0 py-1 hover:text-[#0b192c] transition-colors relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#00b493] hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#contacto"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00b493] hover:bg-[#009b7e] text-[#0b192c] text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00b493]"
            >
              <span>Prueba 1 Hora Gratis</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-[#0b192c] hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b493]"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 shadow-lg">
          <nav className="flex flex-col gap-1 mb-4" aria-label="Navegación móvil">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="min-h-[44px] flex items-center px-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0b192c] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#contacto"
            onClick={() => setMobileOpen(false)}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#00b493] hover:bg-[#009b7e] text-[#0b192c] text-base font-semibold transition-colors"
          >
            <span>Prueba 1 Hora Gratis</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      )}
    </header>
  );
}
