export const LINKEDIN_URL = 'https://www.linkedin.com/in/fernando-vision';
export const LOGO_SRC = '/assets/aistudio/logo_via_d746a80a.jpg';
export const DEMO_VIDEO_SRC = '/assets/aistudio/video_pag_c257f0b1.mp4';

export type VehicleCategoryKey = 'livianos' | 'motos' | 'buses' | 'cargaPesada';

export interface CategoryMeta {
  key: VehicleCategoryKey;
  label: string;
  shortLabel: string;
  strokeColor: string;
  badgeBg: string;
  badgeText: string;
  directionHint: string;
}

export const VEHICLE_CATEGORIES: Record<VehicleCategoryKey, CategoryMeta> = {
  livianos: {
    key: 'livianos',
    label: 'Livianos',
    shortLabel: 'LIVIANO',
    strokeColor: '#e2e8f0',
    badgeBg: 'rgba(226, 232, 240, 0.16)',
    badgeText: '#f8fafc',
    directionHint: 'Automóvil / Camioneta',
  },
  motos: {
    key: 'motos',
    label: 'Motos',
    shortLabel: 'MOTO',
    strokeColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.16)',
    badgeText: '#7dd3fc',
    directionHint: 'Motocicleta',
  },
  buses: {
    key: 'buses',
    label: 'Buses',
    shortLabel: 'BUS',
    strokeColor: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.16)',
    badgeText: '#fde68a',
    directionHint: 'Bus / Buseta / SITP',
  },
  cargaPesada: {
    key: 'cargaPesada',
    label: 'Carga Pesada',
    shortLabel: 'CARGA PESADA',
    strokeColor: '#00d2aa',
    badgeBg: 'rgba(0, 180, 147, 0.2)',
    badgeText: '#5eead4',
    directionHint: 'Camión / Volqueta / Tractocamión',
  },
};

export interface CategoryCounts {
  livianos: number;
  motos: number;
  buses: number;
  cargaPesada: number;
}

export interface CrossingRecord {
  id: string;
  timestamp: string;
  direction: string;
  lane: string;
  category: VehicleCategoryKey;
  frameRef: string;
}

export interface ExcelIntervalRow {
  interval: string;
  livianos: number;
  motos: number;
  buses: number;
  cargaPesada: number;
  isLive?: boolean;
}

export const BASE_EXCEL_INTERVALS: ExcelIntervalRow[] = [
  { interval: '07:00-07:15', livianos: 184, motos: 112, buses: 19, cargaPesada: 26 },
  { interval: '07:15-07:30', livianos: 218, motos: 136, buses: 22, cargaPesada: 31 },
  { interval: '07:30-07:45', livianos: 245, motos: 158, buses: 24, cargaPesada: 35 },
  { interval: '07:45-08:00', livianos: 206, motos: 129, buses: 20, cargaPesada: 28, isLive: true },
];

export interface QuoteSummary {
  hoursPerCamera: number;
  cameras: number;
  totalHours: number;
  minTotalCop: number;
  maxTotalCop: number;
  unitMinCop: number;
  unitMaxCop: number;
  manualDays: number;
  viaDeliveryLabel: string;
}

export function calculateQuote(hoursPerCamera: number, cameras: number): QuoteSummary {
  const totalHours = hoursPerCamera * cameras;

  // Dynamic COP rate between $8.000 and $14.000 COP/hour according to volume
  let unitMinCop = 12000;
  let unitMaxCop = 14000;

  if (totalHours >= 240) {
    unitMinCop = 8000;
    unitMaxCop = 9000;
  } else if (totalHours >= 120) {
    unitMinCop = 8500;
    unitMaxCop = 10000;
  } else if (totalHours >= 48) {
    unitMinCop = 9500;
    unitMaxCop = 11500;
  } else if (totalHours >= 20) {
    unitMinCop = 11000;
    unitMaxCop = 13000;
  }

  const minTotalCop = totalHours * unitMinCop;
  const maxTotalCop = totalHours * unitMaxCop;

  // Traditional manual counting + digitization + QA (~8 video hours per workday)
  const manualDays = Math.max(1, Math.ceil(totalHours / 8));

  // VIA parallel processing delivery estimate in hours
  let viaDeliveryLabel = '4 a 8 horas';
  if (totalHours > 300) {
    viaDeliveryLabel = '36 a 48 horas';
  } else if (totalHours > 120) {
    viaDeliveryLabel = '24 a 36 horas';
  } else if (totalHours > 40) {
    viaDeliveryLabel = '12 a 24 horas';
  } else if (totalHours > 16) {
    viaDeliveryLabel = '8 a 14 horas';
  }

  return {
    hoursPerCamera,
    cameras,
    totalHours,
    minTotalCop,
    maxTotalCop,
    unitMinCop,
    unitMaxCop,
    manualDays,
    viaDeliveryLabel,
  };
}

export function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}
