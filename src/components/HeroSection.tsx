import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Pause, Film, ScanLine, FileSpreadsheet } from 'lucide-react';
import { DEMO_VIDEO_SRC } from '../constants';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {
      setIsPlaying(false);
    });
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section
      id="hero"
      className="relative bg-[#fafbfc] bg-tech-grid border-b border-slate-200 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: High-Contrast Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs sm:text-[13px] font-mono font-semibold tracking-wider uppercase text-[#008f75]">
              Aforo vehicular con IA <span aria-hidden="true" className="mx-1.5 text-slate-400">·</span> Bogotá, Colombia
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-[#0b192c] leading-[1.06] tracking-tight">
              Si se mueve, lo contamos.
            </h1>

            <h2 className="font-sans text-lg sm:text-xl text-slate-700 font-normal leading-relaxed max-w-2xl">
              Deja atrás el aforo manual lento, costoso y con errores por fatiga. Envíanos tus videos de tráfico y recibe tu matriz en Excel cada 15 minutos en horas, no en días.
            </h2>

            {/* Clear COP Price Anchor */}
            <p className="text-sm sm:text-[15px] font-mono text-[#0b192c] border-t border-slate-200/90 pt-4 leading-relaxed">
              Tarifas en pesos colombianos desde{' '}
              <strong className="font-bold text-[#008f75]">$8.000 COP/hora</strong> según volumen
              <span aria-hidden="true" className="mx-2 text-slate-400">·</span>
              Sin licencias ni hardware.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
              <a
                href="#contacto"
                className="min-h-[48px] px-6 py-3.5 rounded-lg bg-[#00b493] hover:bg-[#009b7e] text-[#0b192c] text-sm sm:text-base font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00b493]"
              >
                <span>Procesar 1 Hora Gratis</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href="#simulador"
                className="min-h-[48px] px-6 py-3.5 rounded-lg bg-white hover:bg-slate-100 text-[#0b192c] border border-slate-300 text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0b192c]"
              >
                <Play className="w-4 h-4 text-[#008f75]" aria-hidden="true" />
                <span>Ver Demo en Vivo</span>
              </a>
            </div>
          </div>

          {/* Right Column: Clean Dark Real-Video Showcase + 3-Step Flow */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-[#0b192c] border border-slate-800 overflow-hidden shadow-xl">
              {/* Top Video Container */}
              <div className="relative aspect-[16/10] sm:aspect-video bg-[#07101d] overflow-hidden">
                {!videoError ? (
                  <>
                    <video
                      ref={videoRef}
                      src={DEMO_VIDEO_SRC}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={() => setVideoError(true)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b192c]/90 via-[#0b192c]/35 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                      <span className="text-[11px] sm:text-xs font-mono text-slate-200 tracking-tight">
                        Detección real en corredor vial colombiano · 4 categorías
                      </span>
                      <button
                        type="button"
                        onClick={togglePlayback}
                        aria-label={isPlaying ? 'Pausar video demo' : 'Reproducir video demo'}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0b192c]/80 hover:bg-[#0b192c] text-white border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b493]"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Clean 3-Step Fallback if video cannot load */
                  <div className="w-full h-full bg-dark-grid flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#00d2aa] mb-5">
                      Flujo de procesamiento VIA
                    </p>
                    <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col items-center gap-2">
                        <Film className="w-5 h-5 text-[#00d2aa]" />
                        <span className="text-xs font-mono text-white font-semibold">1. Tu Video</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col items-center gap-2">
                        <ScanLine className="w-5 h-5 text-[#00d2aa]" />
                        <span className="text-xs font-mono text-white font-semibold">2. Detección IA</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-[#00d2aa]" />
                        <span className="text-xs font-mono text-white font-semibold">3. Excel 15 min</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clean 3-Step Process Strip */}
              <div className="px-4 py-3.5 sm:px-5 bg-[#0b192c] border-t border-slate-800 grid grid-cols-3 gap-2 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Film className="w-4 h-4 text-[#00d2aa] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-mono text-slate-200 font-medium">1. Tu Video</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:border-l sm:border-slate-800 sm:pl-3">
                  <ScanLine className="w-4 h-4 text-[#00d2aa] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-mono text-slate-200 font-medium">2. Detección IA</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:border-l sm:border-slate-800 sm:pl-3">
                  <FileSpreadsheet className="w-4 h-4 text-[#00d2aa] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-mono text-slate-200 font-medium">3. Excel 15 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
