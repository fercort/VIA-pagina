import { useEffect } from 'react';
import { X, ShieldCheck, Clock, Navigation, Camera } from 'lucide-react';
import { CrossingRecord, VEHICLE_CATEGORIES } from '../constants';

interface AuditModalProps {
  record: CrossingRecord | null;
  onClose: () => void;
}

function VehicleEvidenceGraphic({ category, id }: { category: CrossingRecord['category']; id: string }) {
  const meta = VEHICLE_CATEGORIES[category];

  return (
    <div className="relative rounded-xl bg-[#07101d] border border-slate-800 p-4 overflow-hidden">
      {/* Subtle road markings */}
      <svg viewBox="0 0 360 120" className="w-full h-28 sm:h-32">
        <rect x="0" y="0" width="360" height="120" fill="#07101d" />
        {/* Lane lines */}
        <line x1="0" y1="22" x2="360" y2="22" stroke="#1e293b" strokeWidth="1" strokeDasharray="8 6" />
        <line x1="0" y1="98" x2="360" y2="98" stroke="#1e293b" strokeWidth="1" strokeDasharray="8 6" />

        {/* Virtual counting line */}
        <line x1="184" y1="8" x2="184" y2="112" stroke="#00b493" strokeWidth="2" strokeDasharray="4 3" />
        <text x="190" y="18" fill="#00d2aa" fontSize="8" fontFamily="JetBrains Mono, monospace">
          LÍNEA VIRTUAL
        </text>

        {/* Vehicle silhouette by category */}
        {category === 'motos' && (
          <g transform="translate(152, 46)">
            <rect x="0" y="6" width="54" height="16" rx="8" fill="#1e293b" stroke={meta.strokeColor} strokeWidth="1.5" />
            <circle cx="10" cy="14" r="5" fill="#0b192c" stroke={meta.strokeColor} strokeWidth="1.5" />
            <circle cx="44" cy="14" r="5" fill="#0b192c" stroke={meta.strokeColor} strokeWidth="1.5" />
            <rect x="-8" y="-2" width="70" height="32" fill="none" stroke={meta.strokeColor} strokeWidth="1.5" strokeDasharray="3 2" />
          </g>
        )}

        {category === 'livianos' && (
          <g transform="translate(132, 38)">
            <rect x="0" y="6" width="96" height="32" rx="6" fill="#1e293b" stroke={meta.strokeColor} strokeWidth="1.5" />
            <rect x="22" y="10" width="44" height="24" rx="3" fill="#334155" />
            <rect x="-8" y="-2" width="112" height="48" fill="none" stroke={meta.strokeColor} strokeWidth="1.5" strokeDasharray="3 2" />
          </g>
        )}

        {category === 'buses' && (
          <g transform="translate(102, 34)">
            <rect x="0" y="4" width="156" height="40" rx="5" fill="#1e293b" stroke={meta.strokeColor} strokeWidth="1.5" />
            <rect x="12" y="10" width="130" height="28" rx="2" fill="#334155" />
            <rect x="-8" y="-4" width="172" height="56" fill="none" stroke={meta.strokeColor} strokeWidth="1.5" strokeDasharray="3 2" />
          </g>
        )}

        {category === 'cargaPesada' && (
          <g transform="translate(94, 34)">
            <rect x="0" y="4" width="122" height="40" rx="3" fill="#1e293b" stroke={meta.strokeColor} strokeWidth="1.5" />
            <rect x="126" y="7" width="44" height="34" rx="4" fill="#334155" stroke={meta.strokeColor} strokeWidth="1.5" />
            <rect x="-8" y="-4" width="186" height="56" fill="none" stroke={meta.strokeColor} strokeWidth="1.5" strokeDasharray="3 2" />
          </g>
        )}

        {/* Track label */}
        <rect x="14" y="92" width="142" height="18" rx="3" fill="#0b192c" stroke="#334155" strokeWidth="1" />
        <text x="20" y="104" fill="#e2e8f0" fontSize="9" fontFamily="JetBrains Mono, monospace">
          {id} · {meta.shortLabel}
        </text>
      </svg>
    </div>
  );
}

export function AuditModal({ record, onClose }: AuditModalProps) {
  useEffect(() => {
    if (!record) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [record, onClose]);

  if (!record) return null;

  const meta = VEHICLE_CATEGORIES[record.category];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0b192c] border border-slate-700 text-white p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar registro de cruce"
          className="absolute top-4 right-4 w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b493]"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00d2aa] mb-1">
          Trazabilidad VIA · {record.id}
        </p>
        <h3 id="audit-modal-title" className="text-xl sm:text-2xl font-bold text-white mb-5">
          Registro Verificable de Cruce
        </h3>

        {/* Evidence Frame Snapshot */}
        <div className="mb-5">
          <VehicleEvidenceGraphic category={record.category} id={record.id} />
        </div>

        {/* Clear Business Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-sm">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#00d2aa]" aria-hidden="true" />
              <span>Hora exacta</span>
            </div>
            <p className="font-mono font-semibold text-white tabular-nums">{record.timestamp}</p>
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
              <Navigation className="w-3.5 h-3.5 text-[#00d2aa]" aria-hidden="true" />
              <span>Sentido</span>
            </div>
            <p className="font-mono font-semibold text-white">
              {record.direction} · {record.lane}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d2aa]" aria-hidden="true" />
              <span>Categoría registrada</span>
            </div>
            <p className="font-semibold text-white">
              {meta.label}{' '}
              <span className="text-xs font-normal text-slate-400">({meta.directionHint})</span>
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
              <Camera className="w-3.5 h-3.5 text-[#00d2aa]" aria-hidden="true" />
              <span>Evidencia visual guardada</span>
            </div>
            <p className="font-mono text-xs text-[#00d2aa] font-semibold">
              {record.frameRef} · Disponible
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Respaldo visual listo para revisión de interventoría si se cuestiona el dato.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors shrink-0"
          >
            Cerrar registro
          </button>
        </div>
      </div>
    </div>
  );
}
