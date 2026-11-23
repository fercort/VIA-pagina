import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Compartes tus grabaciones',
    description:
      'Nos pasas el enlace de Google Drive, OneDrive o WeTransfer por LinkedIn. Funciona con cualquier cámara fija, GoPro, dron estacionario o CCTV (MP4/MOV).',
  },
  {
    num: '02',
    title: 'Procesamos con IA y transparencia',
    description:
      'Configuramos las líneas virtuales por sentido. Si hay lluvia fuerte, noche u oclusión severa, reportamos explícitamente los tramos sin visibilidad; nunca inventamos datos ni rellenamos ceros falsos.',
  },
  {
    num: '03',
    title: 'Recibes tu Excel listo',
    description:
      'Descargas la matriz cada 15 minutos y el consolidado horario. Confidencialidad total: eliminamos tus videos tras la entrega si así lo solicitas.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-16 sm:py-20 bg-[#fafbfc] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Block 1: 3 Frictionless Steps */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[#008f75] mb-2">
            Proceso simple y auditable
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b192c] tracking-tight leading-tight">
            De tu video en Drive a tu Excel en 3 pasos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 flex flex-col"
            >
              <span className="font-mono text-sm font-bold text-[#008f75] mb-3 block">
                {step.num}
              </span>
              <h3 className="text-lg font-bold text-[#0b192c] mb-2.5">
                {step.title}
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Block 2: Honest Service Scope (2 Clear Cards) */}
        <div className="pt-10 border-t border-slate-200">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Alcance honesto del servicio
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0b192c] tracking-tight">
              Lo que entregamos hoy vs. nuestra línea de investigación
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Card 1: Disponible hoy */}
            <div className="rounded-2xl bg-white border-2 border-[#00b493] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#008f75] mb-2">
                  Disponible hoy · Entrega inmediata
                </p>
                <h4 className="text-xl sm:text-2xl font-bold text-[#0b192c] mb-3">
                  Aforo Clasificado Estándar (4 Categorías)
                </h4>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-6">
                  Desglose en <strong className="text-[#0b192c] font-semibold">Livianos, Motos, Buses y Carga Pesada</strong> cada 15 minutos. Ideal para PMTs, estudios urbanos, retail, estaciones de servicio y auditoría de accesos.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600">
                <span>Livianos · Motos · Buses · Carga Pesada</span>
                <a
                  href="#contacto"
                  className="text-[#008f75] font-semibold hover:text-[#0b192c] inline-flex items-center gap-1 transition-colors"
                >
                  <span>Probar 1 hora gratis</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Card 2: Programa Piloto I+D */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Programa Piloto I+D · Validación en curso
                </p>
                <h4 className="text-xl sm:text-2xl font-bold text-[#0b192c] mb-3">
                  Clasificación Avanzada por Ejes (C2 a C6)
                </h4>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-6">
                  Tecnología en validación experimental (respaldada por investigación de Maestría en Analítica de Datos) para desglose de carga pesada por ejes y manejo explícito de incertidumbre.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                <a
                  href="#contacto"
                  className="min-h-[44px] px-4 py-2.5 rounded-lg bg-white hover:bg-[#0b192c] hover:text-white text-[#0b192c] border border-slate-300 text-sm font-semibold inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b493]"
                >
                  <span>Postular vía para piloto C2–C6</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
