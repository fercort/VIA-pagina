import { useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { LINKEDIN_URL, QuoteSummary, formatCop } from '../constants';

interface ContactSectionProps {
  activeQuote: QuoteSummary | null;
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export function ContactSection({ activeQuote }: ContactSectionProps) {
  const [copied, setCopied] = useState(false);

  const suggestedMessage = activeQuote
    ? `Hola Fernando, quiero mi hora gratis de aforo con VIA. Tengo un proyecto estimado de ${activeQuote.totalHours} horas de video (${activeQuote.cameras} ${activeQuote.cameras === 1 ? 'estación' : 'estaciones'}).`
    : 'Hola Fernando, quiero mi hora gratis de aforo con VIA.';

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(suggestedMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = suggestedMessage;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (ok) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2400);
        }
      } catch {
        setCopied(false);
      }
    }
  };

  return (
    <section id="contacto" className="py-16 sm:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0b192c] bg-dark-grid border border-slate-800 p-7 sm:p-10 lg:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00d2aa] mb-3">
              Desarrollado en Bogotá, Colombia <span aria-hidden="true" className="mx-1.5 text-slate-500">·</span> Atención directa
            </p>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Compruébalo con tu propio video: procesamos 1 hora gratis.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
              Compara nuestro Excel contra tu aforo manual actual sin compromiso. Hablas directo con el equipo de ingeniería, sin bots ni formularios largos.
            </p>

            {/* Optional dynamic volume note when coming from calculator */}
            {activeQuote && (
              <div className="mb-7 inline-block rounded-xl bg-slate-900/90 border border-[#00b493]/40 px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-200 tabular-nums">
                Volumen seleccionado:{' '}
                <strong className="text-[#00d2aa]">{activeQuote.totalHours} h</strong> (
                {activeQuote.cameras} {activeQuote.cameras === 1 ? 'cámara' : 'cámaras'}) · Ref.{' '}
                {formatCop(activeQuote.minTotalCop)} – {formatCop(activeQuote.maxTotalCop)}
              </div>
            )}

            {/* 3-Step Micro-Guide to reduce LinkedIn friction */}
            <div className="mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-mono text-slate-200">
                <span>
                  <strong className="text-[#00d2aa]">1.</strong> Haz clic abajo
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 sm:rotate-0 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-[#00d2aa]">2.</strong> Escríbeme &ldquo;Quiero mi hora gratis&rdquo;
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 sm:rotate-0 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-[#00d2aa]">3.</strong> Me compartes el link de Drive
                </span>
              </div>
            </div>

            {/* Primary Big LinkedIn CTA */}
            <div className="flex flex-col items-center gap-3.5">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[54px] px-7 py-4 rounded-xl bg-[#00b493] hover:bg-[#009b7e] text-[#0b192c] text-base font-bold inline-flex items-center justify-center gap-3 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b192c] focus-visible:ring-[#00b493]"
              >
                <LinkedInIcon className="w-5 h-5 shrink-0" />
                <span>Escribir por LinkedIn — respondo el mismo día</span>
              </a>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="min-h-[40px] px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-[#00d2aa] inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b493] rounded"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00d2aa]" aria-hidden="true" />
                    <span className="text-[#00d2aa]">Mensaje copiado al portapapeles</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copiar mensaje listo para pegar en LinkedIn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
