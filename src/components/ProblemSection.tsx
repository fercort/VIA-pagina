import { X, Check } from 'lucide-react';

const MANUAL_PAINS = [
  'Entregas lentas que retrasan la radicación de tus PMTs y estudios.',
  'Errores de conteo por cansancio humano en jornadas largas y horas pico.',
  'Cero trazabilidad: si la interventoría cuestiona un dato, no hay respaldo visual.',
  'Altos costos operativos por cuadrillas en campo y digitación.',
];

const VIA_ADVANTAGES = [
  {
    lead: 'Entrega en horas:',
    detail: 'Procesamos decenas de horas de video en paralelo.',
  },
  {
    lead: 'Trazabilidad auditable:',
    detail: 'Cada cruce respaldado por registro visual verificable.',
  },
  {
    lead: 'Formato de ingeniería:',
    detail: 'Matrices cada 15 minutos por sentido, listas para usar.',
  },
  {
    lead: 'Hasta 50% más económico',
    detail: 'que el aforo manual tradicional.',
  },
];

export function ProblemSection() {
  return (
    <section id="problema" className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 sm:mb-12">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2">
            El problema que resolvemos
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b192c] tracking-tight leading-tight">
            ¿Por qué seguir pagando días de digitación manual por un Excel?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Left: Aforo Manual Tradicional */}
          <div className="rounded-2xl bg-slate-50/80 border border-red-200/80 p-6 sm:p-8 flex flex-col">
            <div className="pb-5 mb-6 border-b border-red-200/60">
              <p className="text-xs font-mono uppercase tracking-wider text-red-700 font-semibold mb-1">
                Método tradicional
              </p>
              <h3 className="text-xl font-bold text-slate-800">
                Aforo Manual Tradicional
              </h3>
            </div>

            <ul className="space-y-4 text-sm sm:text-[15px] text-slate-600 leading-relaxed flex-1">
              {MANUAL_PAINS.map((pain) => (
                <li key={pain} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Con VIA */}
          <div className="rounded-2xl bg-white border-2 border-[#00b493] p-6 sm:p-8 shadow-sm flex flex-col">
            <div className="pb-5 mb-6 border-b border-slate-200">
              <p className="text-xs font-mono uppercase tracking-wider text-[#008f75] font-semibold mb-1">
                Visión artificial aplicada
              </p>
              <h3 className="text-xl font-bold text-[#0b192c]">
                Con VIA
              </h3>
            </div>

            <ul className="space-y-4 text-sm sm:text-[15px] text-slate-700 leading-relaxed flex-1">
              {VIA_ADVANTAGES.map((item) => (
                <li key={item.lead} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#00b493]/15 text-[#008f75] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                  <span>
                    <strong className="font-semibold text-[#0b192c]">{item.lead}</strong>{' '}
                    {item.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
