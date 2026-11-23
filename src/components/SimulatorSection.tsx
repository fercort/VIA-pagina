import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Download,
  FileSpreadsheet,
  ArrowRight,
  Eye,
  Calculator,
} from 'lucide-react';
import {
  BASE_EXCEL_INTERVALS,
  CategoryCounts,
  CrossingRecord,
  QuoteSummary,
  VEHICLE_CATEGORIES,
  VehicleCategoryKey,
  calculateQuote,
  formatCop,
} from '../constants';

interface SimulatorSectionProps {
  onAuditRecord: (record: CrossingRecord) => void;
  onSelectQuote: (quote: QuoteSummary) => void;
}

interface SimVehicle {
  uid: number;
  trackId: string;
  category: VehicleCategoryKey;
  laneIndex: number; // 0, 1: right-to-left (Norte-Sur); 2, 3: left-to-right (Sur-Norte)
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 'Norte–Sur' | 'Sur–Norte';
  counted: boolean;
  flashAlpha: number;
  frameNumber: number;
}

interface CrossingFlash {
  y: number;
  alpha: number;
  color: string;
}

const INITIAL_COUNTS: CategoryCounts = {
  livianos: 0,
  motos: 0,
  buses: 0,
  cargaPesada: 0,
};

function formatNowTime(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

function pickWeightedCategory(): VehicleCategoryKey {
  const r = Math.random();
  if (r < 0.46) return 'livianos';
  if (r < 0.78) return 'motos';
  if (r < 0.88) return 'buses';
  return 'cargaPesada';
}

function getLaneCenterY(laneIndex: number, canvasHeight: number): number {
  const ratios = [0.24, 0.4, 0.61, 0.77];
  return canvasHeight * (ratios[laneIndex] ?? 0.5);
}

function getVehicleDimensions(
  category: VehicleCategoryKey,
  canvasWidth: number
): { width: number; height: number; baseSpeed: number } {
  const scale = Math.max(0.68, Math.min(1, canvasWidth / 640));
  switch (category) {
    case 'motos':
      return { width: Math.round(26 * scale), height: Math.round(11 * scale), baseSpeed: 2.35 * scale };
    case 'livianos':
      return { width: Math.round(46 * scale), height: Math.round(19 * scale), baseSpeed: 1.95 * scale };
    case 'buses':
      return { width: Math.round(76 * scale), height: Math.round(23 * scale), baseSpeed: 1.42 * scale };
    case 'cargaPesada':
      return { width: Math.round(86 * scale), height: Math.round(24 * scale), baseSpeed: 1.26 * scale };
  }
}

export function SimulatorSection({ onAuditRecord, onSelectQuote }: SimulatorSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vehiclesRef = useRef<SimVehicle[]>([]);
  const flashesRef = useRef<CrossingFlash[]>([]);
  const nextUidRef = useRef<number>(101);
  const frameCounterRef = useRef<number>(1420);
  const isRunningRef = useRef<boolean>(true);
  const spawnAccumulatorRef = useRef<number>(0);

  const [isRunning, setIsRunning] = useState(true);
  const [counts, setCounts] = useState<CategoryCounts>(INITIAL_COUNTS);
  const [auditLog, setAuditLog] = useState<CrossingRecord[]>([]);
  const [downloadDone, setDownloadDone] = useState(false);

  // Calculator state
  const [hoursPerCamera, setHoursPerCamera] = useState(24);
  const [cameras, setCameras] = useState(2);

  const quote = useMemo(() => calculateQuote(hoursPerCamera, cameras), [hoursPerCamera, cameras]);

  const totalCount = counts.livianos + counts.motos + counts.buses + counts.cargaPesada;

  // Build live 15-min Excel rows where 07:45-08:00 syncs live with simulator counts
  const excelRows = useMemo(() => {
    return BASE_EXCEL_INTERVALS.map((row) => {
      if (!row.isLive) return row;
      return {
        ...row,
        livianos: row.livianos + counts.livianos,
        motos: row.motos + counts.motos,
        buses: row.buses + counts.buses,
        cargaPesada: row.cargaPesada + counts.cargaPesada,
      };
    });
  }, [counts]);

  const excelTotals = useMemo(() => {
    return excelRows.reduce(
      (acc, row) => ({
        livianos: acc.livianos + row.livianos,
        motos: acc.motos + row.motos,
        buses: acc.buses + row.buses,
        cargaPesada: acc.cargaPesada + row.cargaPesada,
      }),
      { livianos: 0, motos: 0, buses: 0, cargaPesada: 0 }
    );
  }, [excelRows]);

  const excelGrandTotal =
    excelTotals.livianos + excelTotals.motos + excelTotals.buses + excelTotals.cargaPesada;

  const spawnVehicle = useCallback(
    (forcedCategory?: VehicleCategoryKey, canvasWidth = 720, canvasHeight = 360, immediate = false) => {
      const category = forcedCategory ?? pickWeightedCategory();
      const { width, height, baseSpeed } = getVehicleDimensions(category, canvasWidth);

      // 4 horizontal lanes: 0,1 move Left (Norte-Sur); 2,3 move Right (Sur-Norte)
      const candidateLanes = [0, 1, 2, 3].sort(() => Math.random() - 0.5);

      let chosenLane = -1;
      let bestLaneFallback = candidateLanes[0];
      let bestMinDistance = -1;

      for (const laneIndex of candidateLanes) {
        const movesRight = laneIndex >= 2;
        const startX = immediate
          ? movesRight
            ? 14
            : canvasWidth - width - 14
          : movesRight
            ? -width - 14
            : canvasWidth + 14;

        let minDistance = Infinity;
        for (const v of vehiclesRef.current) {
          if (v.laneIndex !== laneIndex) continue;
          const dist = Math.abs(v.x - startX);
          if (dist < minDistance) minDistance = dist;
        }

        if (minDistance > bestMinDistance) {
          bestMinDistance = minDistance;
          bestLaneFallback = laneIndex;
        }

        if (minDistance >= width + 48) {
          chosenLane = laneIndex;
          break;
        }
      }

      if (chosenLane === -1) {
        if (!forcedCategory) return;
        chosenLane = bestLaneFallback;
      }

      const movesRight = chosenLane >= 2;
      const uid = nextUidRef.current++;
      const speedVariation = 0.9 + Math.random() * 0.22;
      const startX = immediate
        ? movesRight
          ? 14
          : canvasWidth - width - 14
        : movesRight
          ? -width - 12
          : canvasWidth + 12;

      vehiclesRef.current.push({
        uid,
        trackId: `#VIA-${uid}`,
        category,
        laneIndex: chosenLane,
        x: startX,
        y: getLaneCenterY(chosenLane, canvasHeight) - height / 2,
        width,
        height,
        speed: (movesRight ? 1 : -1) * baseSpeed * speedVariation,
        direction: movesRight ? 'Sur–Norte' : 'Norte–Sur',
        counted: false,
        flashAlpha: immediate ? 0.8 : 0,
        frameNumber: frameCounterRef.current,
      });
    },
    []
  );

  // Seed initial traffic so canvas is immediately alive on first paint
  const seedInitialTraffic = useCallback((canvasWidth: number, canvasHeight: number) => {
    vehiclesRef.current = [];
    flashesRef.current = [];
    const presets: Array<{ category: VehicleCategoryKey; laneIndex: number; xRatio: number }> = [
      { category: 'livianos', laneIndex: 0, xRatio: 0.72 },
      { category: 'motos', laneIndex: 1, xRatio: 0.62 },
      { category: 'cargaPesada', laneIndex: 2, xRatio: 0.22 },
      { category: 'buses', laneIndex: 3, xRatio: 0.36 },
      { category: 'livianos', laneIndex: 2, xRatio: 0.04 },
    ];

    for (const p of presets) {
      const { width, height, baseSpeed } = getVehicleDimensions(p.category, canvasWidth);
      const movesRight = p.laneIndex >= 2;
      const uid = nextUidRef.current++;
      vehiclesRef.current.push({
        uid,
        trackId: `#VIA-${uid}`,
        category: p.category,
        laneIndex: p.laneIndex,
        x: canvasWidth * p.xRatio,
        y: getLaneCenterY(p.laneIndex, canvasHeight) - height / 2,
        width,
        height,
        speed: (movesRight ? 1 : -1) * baseSpeed,
        direction: movesRight ? 'Sur–Norte' : 'Norte–Sur',
        counted: false,
        flashAlpha: 0,
        frameNumber: frameCounterRef.current,
      });
    }
  }, []);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let logicalWidth = 720;
    let logicalHeight = 360;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const prevWidth = logicalWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      logicalWidth = rect.width;
      logicalHeight = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-align active vehicles cleanly on viewport resize
      const widthRatio = prevWidth > 0 ? logicalWidth / prevWidth : 1;
      for (const v of vehiclesRef.current) {
        const dims = getVehicleDimensions(v.category, logicalWidth);
        v.x = v.x * widthRatio;
        v.width = dims.width;
        v.height = dims.height;
        v.y = getLaneCenterY(v.laneIndex, logicalHeight) - v.height / 2;
        v.speed = (v.speed >= 0 ? 1 : -1) * dims.baseSpeed;
      }
    };

    resizeCanvas();
    seedInitialTraffic(logicalWidth, logicalHeight);

    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    observer.observe(canvas);

    let lastTime = performance.now();

    const drawRoad = (w: number, h: number, lineX: number) => {
      const roadTop = h * 0.13;
      const roadBottom = h * 0.88;
      const centerY = (roadTop + roadBottom) / 2;

      // Asphalt background
      ctx.fillStyle = '#091322';
      ctx.fillRect(0, 0, w, h);

      // Road surface
      ctx.fillStyle = '#0d1b30';
      ctx.fillRect(0, roadTop, w, roadBottom - roadTop);

      // Outer road edge lines
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, roadTop);
      ctx.lineTo(w, roadTop);
      ctx.moveTo(0, roadBottom);
      ctx.lineTo(w, roadBottom);
      ctx.stroke();

      // Double center median divider
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY - 2.5);
      ctx.lineTo(w, centerY - 2.5);
      ctx.moveTo(0, centerY + 2.5);
      ctx.lineTo(w, centerY + 2.5);
      ctx.stroke();

      // Dashed lane dividers
      ctx.save();
      ctx.setLineDash([14, 14]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.32);
      ctx.lineTo(w, h * 0.32);
      ctx.moveTo(0, h * 0.69);
      ctx.lineTo(w, h * 0.69);
      ctx.stroke();
      ctx.restore();

      // Direction annotations in dedicated safe margins
      ctx.font = w < 440 ? '500 9px "JetBrains Mono", monospace' : '500 10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
      ctx.fillText('← NORTE–SUR', 10, roadTop - 8);
      ctx.fillText('SUR–NORTE →', 10, roadBottom + 14);

      // Virtual Counting Line
      ctx.save();
      ctx.strokeStyle = '#00b493';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(lineX, roadTop - 4);
      ctx.lineTo(lineX, roadBottom + 4);
      ctx.stroke();
      ctx.restore();

      // Counting line label
      const labelW = w < 440 ? 96 : 116;
      ctx.fillStyle = 'rgba(0, 180, 147, 0.2)';
      ctx.fillRect(lineX - labelW / 2, 4, labelW, 16);
      ctx.fillStyle = '#00d2aa';
      ctx.font = w < 440 ? '600 8.5px "JetBrains Mono", monospace' : '600 9.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LÍNEA VIRTUAL VIA', lineX, 15);
      ctx.textAlign = 'left';
    };

    const drawVehicle = (v: SimVehicle, w: number) => {
      const meta = VEHICLE_CATEGORIES[v.category];
      const cx = v.x;
      const cy = v.y;

      // Vehicle chassis
      ctx.fillStyle = v.category === 'cargaPesada' ? '#162c44' : '#1e293b';
      ctx.strokeStyle = meta.strokeColor;
      ctx.lineWidth = 1.25;

      if (v.category === 'cargaPesada') {
        const isRight = v.speed > 0;
        const cabW = Math.round(v.width * 0.23);
        const trailerW = v.width - cabW - 3;
        if (isRight) {
          ctx.fillRect(cx, cy, trailerW, v.height);
          ctx.strokeRect(cx, cy, trailerW, v.height);
          ctx.fillStyle = '#294563';
          ctx.fillRect(cx + trailerW + 3, cy + 2, cabW, v.height - 4);
          ctx.strokeRect(cx + trailerW + 3, cy + 2, cabW, v.height - 4);
        } else {
          ctx.fillStyle = '#294563';
          ctx.fillRect(cx, cy + 2, cabW, v.height - 4);
          ctx.strokeRect(cx, cy + 2, cabW, v.height - 4);
          ctx.fillStyle = '#162c44';
          ctx.fillRect(cx + cabW + 3, cy, trailerW, v.height);
          ctx.strokeRect(cx + cabW + 3, cy, trailerW, v.height);
        }
      } else {
        ctx.beginPath();
        ctx.roundRect(cx, cy, v.width, v.height, v.category === 'motos' ? 5 : 4);
        ctx.fill();
        ctx.stroke();

        // Subtle windshield accent for livianos & buses
        if (v.category === 'livianos' || v.category === 'buses') {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
          ctx.fillRect(cx + v.width * 0.22, cy + 3, v.width * 0.52, v.height - 6);
        }
      }

      // Detection Bounding Box
      const pad = 3.5;
      ctx.save();
      ctx.strokeStyle = v.counted ? '#00d2aa' : meta.strokeColor;
      ctx.lineWidth = v.flashAlpha > 0.05 ? 2 : 1.1;
      ctx.strokeRect(cx - pad, cy - pad, v.width + pad * 2, v.height + pad * 2);

      // Compact tracking tag above box
      const compactTag = w < 440 ? meta.shortLabel : `${v.trackId} ${meta.shortLabel}`;
      ctx.font = w < 440 ? '600 8px "JetBrains Mono", monospace' : '600 9px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(compactTag).width;
      const tagX = cx - pad;
      const tagY = cy - pad - 13;

      ctx.fillStyle = v.counted ? 'rgba(0, 180, 147, 0.92)' : 'rgba(11, 25, 44, 0.9)';
      ctx.fillRect(tagX, tagY, textWidth + 7, 12);

      ctx.fillStyle = v.counted ? '#0b192c' : meta.strokeColor;
      ctx.fillText(compactTag, tagX + 3.5, tagY + 9);
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.667, 2.2);
      lastTime = now;

      const lineX = logicalWidth * 0.52;

      if (isRunningRef.current) {
        frameCounterRef.current += 1;
        spawnAccumulatorRef.current += dt;

        // Spawn steady natural Colombian arterial flow
        if (spawnAccumulatorRef.current >= 40) {
          spawnAccumulatorRef.current = 0;
          if (vehiclesRef.current.length < 13) {
            spawnVehicle(undefined, logicalWidth, logicalHeight, false);
          }
        }

        const newlyCounted: SimVehicle[] = [];

        for (const v of vehiclesRef.current) {
          const prevCenterX = v.x + v.width / 2;
          v.x += v.speed * dt;
          v.y = getLaneCenterY(v.laneIndex, logicalHeight) - v.height / 2;
          const nextCenterX = v.x + v.width / 2;

          if (!v.counted) {
            const crossedRight = v.speed > 0 && prevCenterX < lineX && nextCenterX >= lineX;
            const crossedLeft = v.speed < 0 && prevCenterX > lineX && nextCenterX <= lineX;
            if (crossedRight || crossedLeft) {
              v.counted = true;
              v.flashAlpha = 1;
              v.frameNumber = frameCounterRef.current;
              newlyCounted.push(v);
              flashesRef.current.push({
                y: v.y + v.height / 2,
                alpha: 1,
                color: VEHICLE_CATEGORIES[v.category].strokeColor,
              });
            }
          }

          if (v.flashAlpha > 0) {
            v.flashAlpha = Math.max(0, v.flashAlpha - 0.03 * dt);
          }
        }

        // Remove offscreen vehicles
        vehiclesRef.current = vehiclesRef.current.filter(
          (v) => v.x > -v.width - 80 && v.x < logicalWidth + 80
        );

        // Update flash markers
        flashesRef.current = flashesRef.current
          .map((f) => ({ ...f, alpha: f.alpha - 0.035 * dt }))
          .filter((f) => f.alpha > 0.02);

        // Commit state updates for crossed vehicles
        if (newlyCounted.length > 0) {
          setCounts((prev) => {
            const next = { ...prev };
            for (const v of newlyCounted) {
              next[v.category] += 1;
            }
            return next;
          });

          const newRecords: CrossingRecord[] = newlyCounted.map((v) => ({
            id: v.trackId,
            timestamp: formatNowTime(),
            direction: v.direction,
            lane: `Carril ${(v.laneIndex % 2) + 1}`,
            category: v.category,
            frameRef: `FRAME_${String(v.frameNumber).padStart(5, '0')}.JPG`,
          }));

          setAuditLog((prev) => [...newRecords.reverse(), ...prev].slice(0, 18));
        }
      }

      // Render frame
      drawRoad(logicalWidth, logicalHeight, lineX);

      // Draw crossing flashes on virtual line
      for (const flash of flashesRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(lineX, flash.y, 12 * (1.2 - flash.alpha * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 210, 170, ${flash.alpha * 0.45})`;
        ctx.fill();
        ctx.restore();
      }

      for (const v of vehiclesRef.current) {
        drawVehicle(v, logicalWidth);
      }

      animId = window.requestAnimationFrame(tick);
    };

    animId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [seedInitialTraffic, spawnVehicle]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const hit = [...vehiclesRef.current].reverse().find(
      (v) =>
        clickX >= v.x - 14 &&
        clickX <= v.x + v.width + 14 &&
        clickY >= v.y - 20 &&
        clickY <= v.y + v.height + 14
    );

    if (hit) {
      onAuditRecord({
        id: hit.trackId,
        timestamp: formatNowTime(),
        direction: hit.direction,
        lane: `Carril ${(hit.laneIndex % 2) + 1}`,
        category: hit.category,
        frameRef: `FRAME_${String(hit.frameNumber).padStart(5, '0')}.JPG`,
      });
    }
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    setCounts(INITIAL_COUNTS);
    setAuditLog([]);
    nextUidRef.current = 101;
    if (rect && rect.width > 0) {
      seedInitialTraffic(rect.width, rect.height);
    }
  };

  const handleInjectHeavyTruck = () => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!isRunningRef.current) {
      setIsRunning(true);
    }
    spawnVehicle('cargaPesada', rect?.width || 720, rect?.height || 360, true);
  };

  const handleDownloadCsv = () => {
    const header = ['INTERVALO', 'LIVIANOS', 'MOTOS', 'BUSES', 'CARGA PESADA', 'TOTAL'];
    const dataLines = excelRows.map((row) => {
      const rowTotal = row.livianos + row.motos + row.buses + row.cargaPesada;
      return [row.interval, row.livianos, row.motos, row.buses, row.cargaPesada, rowTotal].join(',');
    });
    const summaryLine = [
      'TOTAL 07:00-08:00',
      excelTotals.livianos,
      excelTotals.motos,
      excelTotals.buses,
      excelTotals.cargaPesada,
      excelGrandTotal,
    ].join(',');

    // UTF-8 BOM ensures Excel opens Spanish headers cleanly
    const csvContent = '\uFEFF' + [header.join(','), ...dataLines, summaryLine].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'VIA_Plantilla_Aforo_15min_Demo.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadDone(true);
    window.setTimeout(() => setDownloadDone(false), 2500);
  };

  return (
    <section
      id="simulador"
      className="py-16 sm:py-20 bg-[#0b192c] text-white border-b border-slate-800 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14">
        {/* Section Heading + Simulator Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00d2aa] mb-2">
              Demo interactiva, entregable y cotizador
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Mira cómo VIA cuenta, audita y construye tu Excel cada 15 minutos
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsRunning((prev) => !prev)}
              className="min-h-[42px] px-4 py-2 rounded-lg bg-[#00b493] hover:bg-[#009b7e] text-[#0b192c] text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pausar' : 'Reanudar'}</span>
            </button>

            <button
              type="button"
              onClick={handleInjectHeavyTruck}
              className="min-h-[42px] px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-mono font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-[#00d2aa]" aria-hidden="true" />
              <span>Inyectar Carga Pesada</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="min-h-[42px] px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* PART 1: Interactive Traffic Canvas + 4-Category Live Counter & Audit Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Canvas Column */}
          <div className="lg:col-span-7 rounded-2xl bg-[#07101d] border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
              <span>Estación Demo · Corredor Urbano (2 Sentidos)</span>
              <span className="text-slate-400">
                Haz clic en un vehículo o en la bitácora para auditar
              </span>
            </div>

            <div className="relative w-full aspect-[16/9]">
              <canvas
                id="trafficCanvas"
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full block cursor-pointer"
                aria-label="Simulador interactivo de aforo vehicular VIA en 4 categorías"
              />
            </div>

            <div className="px-4 py-2.5 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
              <span>Motor estándar de 4 categorías · Piloto C2–C6 en validación</span>
              <span className="text-[#00d2aa]">{isRunning ? 'Simulación activa' : 'En pausa'}</span>
            </div>
          </div>

          {/* Live 4-Category Tally + Clickable Audit Log */}
          <div className="lg:col-span-5 space-y-5">
            {/* 4 Commercial Categories Panel */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Conteo en Vivo (4 Categorías)</h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Motor estándar de 4 categorías · Piloto C2–C6 en validación
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">Total</span>
                  <span className="text-xl font-bold text-[#00d2aa] tabular-nums">{totalCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="rounded-xl bg-[#07101d] border border-slate-800 p-3">
                  <span className="text-[11px] text-slate-400 block">Livianos</span>
                  <span className="text-xl font-bold text-white tabular-nums">{counts.livianos}</span>
                </div>
                <div className="rounded-xl bg-[#07101d] border border-slate-800 p-3">
                  <span className="text-[11px] text-sky-300 block">Motos</span>
                  <span className="text-xl font-bold text-white tabular-nums">{counts.motos}</span>
                </div>
                <div className="rounded-xl bg-[#07101d] border border-slate-800 p-3">
                  <span className="text-[11px] text-amber-300 block">Buses</span>
                  <span className="text-xl font-bold text-white tabular-nums">{counts.buses}</span>
                </div>
                <div className="rounded-xl bg-[#07101d] border border-[#00b493]/40 p-3">
                  <span className="text-[11px] text-[#00d2aa] block">Carga Pesada</span>
                  <span className="text-xl font-bold text-[#00d2aa] tabular-nums">{counts.cargaPesada}</span>
                </div>
              </div>
            </div>

            {/* Auditable Crossings Log */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Registros verificables de cruce
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Clic para ver evidencia</span>
              </div>

              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-left font-mono text-xs tabular-nums">
                  <thead>
                    <tr className="text-[10px] text-slate-400 border-b border-slate-800">
                      <th className="pb-2 pr-2 font-medium">HORA</th>
                      <th className="pb-2 pr-2 font-medium">CATEGORÍA</th>
                      <th className="pb-2 pr-2 font-medium">SENTIDO</th>
                      <th className="pb-2 text-right font-medium">AUDITAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {auditLog.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-5 text-center text-slate-500">
                          Esperando primer cruce por la línea virtual…
                        </td>
                      </tr>
                    ) : (
                      auditLog.map((item) => (
                        <tr
                          key={`${item.id}-${item.timestamp}`}
                          onClick={() => onAuditRecord(item)}
                          className="hover:bg-slate-800/70 cursor-pointer transition-colors"
                        >
                          <td className="py-2 pr-2 text-slate-300">{item.timestamp.slice(0, 8)}</td>
                          <td className="py-2 pr-2 text-white font-semibold">
                            {VEHICLE_CATEGORIES[item.category].label}
                          </td>
                          <td className="py-2 pr-2 text-slate-400">{item.direction}</td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAuditRecord(item);
                              }}
                              className="inline-flex items-center gap-1 text-[#00d2aa] hover:underline"
                            >
                              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Ver</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* PART 2 & PART 3: Excel 15-Min Preview + Fast ROI Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* PART 2: 15-Minute Excel Preview */}
          <div className="lg:col-span-6 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00b493]/15 border border-[#00b493]/30 flex items-center justify-center text-[#00d2aa] shrink-0">
                    <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Vista Previa del Excel (Intervalos de 15 min)
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      El intervalo 07:45–08:00 suma en vivo con el simulador
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#07101d]">
                <table className="w-full text-left font-mono text-xs tabular-nums">
                  <thead>
                    <tr className="bg-slate-900 text-[10px] sm:text-[11px] text-slate-400 border-b border-slate-800">
                      <th className="py-2.5 px-3 font-semibold">INTERVALO</th>
                      <th className="py-2.5 px-2.5 text-right font-semibold">LIVIANOS</th>
                      <th className="py-2.5 px-2.5 text-right font-semibold">MOTOS</th>
                      <th className="py-2.5 px-2.5 text-right font-semibold">BUSES</th>
                      <th className="py-2.5 px-2.5 text-right font-semibold">CARGA PESADA</th>
                      <th className="py-2.5 px-3 text-right font-semibold text-[#00d2aa]">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-slate-200">
                    {excelRows.map((row) => {
                      const rowTotal = row.livianos + row.motos + row.buses + row.cargaPesada;
                      return (
                        <tr
                          key={row.interval}
                          className={row.isLive ? 'bg-[#00b493]/10' : ''}
                        >
                          <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                            {row.interval}
                            {row.isLive && (
                              <span className="ml-1.5 text-[10px] text-[#00d2aa] font-normal">
                                (en vivo)
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2.5 text-right">{row.livianos}</td>
                          <td className="py-2.5 px-2.5 text-right">{row.motos}</td>
                          <td className="py-2.5 px-2.5 text-right">{row.buses}</td>
                          <td className="py-2.5 px-2.5 text-right">{row.cargaPesada}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#00d2aa]">
                            {rowTotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900/95 border-t border-slate-700 font-bold text-white">
                      <td className="py-2.5 px-3 whitespace-nowrap">TOTAL 07:00–08:00</td>
                      <td className="py-2.5 px-2.5 text-right">{excelTotals.livianos}</td>
                      <td className="py-2.5 px-2.5 text-right">{excelTotals.motos}</td>
                      <td className="py-2.5 px-2.5 text-right">{excelTotals.buses}</td>
                      <td className="py-2.5 px-2.5 text-right">{excelTotals.cargaPesada}</td>
                      <td className="py-2.5 px-3 text-right text-[#00d2aa]">{excelGrandTotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-400">
                Listo para anexar a PMTs y estudios de tránsito
              </span>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="min-h-[44px] px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-[#0b192c] text-xs font-mono font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-[#008f75]" aria-hidden="true" />
                <span>
                  {downloadDone ? 'Plantilla descargada ✓' : 'Descargar Plantilla Demo (.CSV)'}
                </span>
              </button>
            </div>
          </div>

          {/* PART 3: Fast ROI & Time Calculator (#cotizador) */}
          <div
            id="cotizador"
            className="lg:col-span-6 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#00b493]/15 border border-[#00b493]/30 flex items-center justify-center text-[#00d2aa] shrink-0">
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Calculadora Rápida de Ahorro y Tiempo
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Tarifas de referencia entre $8.000 y $14.000 COP/hora según volumen
                  </p>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-5 mb-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <label htmlFor="range-hours" className="text-slate-300 font-semibold">
                      Horas de video por estación
                    </label>
                    <span className="text-sm font-bold text-[#00d2aa] tabular-nums">
                      {hoursPerCamera} horas
                    </span>
                  </div>
                  <input
                    id="range-hours"
                    type="range"
                    min={4}
                    max={168}
                    step={4}
                    value={hoursPerCamera}
                    onChange={(e) => setHoursPerCamera(Number(e.target.value))}
                    className="via-slider w-full"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>4 h (Muestra)</span>
                    <span>24 h (1 día)</span>
                    <span>168 h (1 semana)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <label htmlFor="range-cameras" className="text-slate-300 font-semibold">
                      Estaciones / Cámaras
                    </label>
                    <span className="text-sm font-bold text-[#00d2aa] tabular-nums">
                      {cameras} {cameras === 1 ? 'estación' : 'estaciones'}
                    </span>
                  </div>
                  <input
                    id="range-cameras"
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={cameras}
                    onChange={(e) => setCameras(Number(e.target.value))}
                    className="via-slider w-full"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>1 cámara</span>
                    <span>5 cámaras</span>
                    <span>10 cámaras</span>
                  </div>
                </div>
              </div>

              {/* Real-time Output Metrics */}
              <div className="rounded-xl bg-[#07101d] border border-slate-800 p-4 space-y-3 font-mono text-xs tabular-nums">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-slate-400">Volumen total</span>
                  <span className="text-white font-bold text-sm">
                    {quote.totalHours} horas de video
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Tiempo manual estimado</span>
                    <span className="text-slate-300 font-semibold">
                      ~{quote.manualDays} {quote.manualDays === 1 ? 'día hábil' : 'días hábiles'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Tiempo estimado con VIA</span>
                    <span className="text-[#00d2aa] font-bold">{quote.viaDeliveryLabel}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-slate-400">Inversión estimada (COP)</span>
                    <span className="text-[11px] text-slate-400">
                      {formatCop(quote.unitMinCop)} – {formatCop(quote.unitMaxCop)} / hora
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-white mt-1">
                    {formatCop(quote.minTotalCop)} – {formatCop(quote.maxTotalCop)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800">
              <a
                href="#contacto"
                onClick={() => onSelectQuote(quote)}
                className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-[#00b493] hover:bg-[#009b7e] text-[#0b192c] text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Cotizar este volumen por LinkedIn</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
