'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, FileUp, Focus, MousePointer2, Ruler, RotateCcw } from 'lucide-react';
import { formatSmartNumber } from '@/lib/calculator-utils';
import type { CadModel, Coordinates, UnitId } from './cad-model';
import { drawingUnit, units } from './cad-model';
import type { createCadViewport, Direction } from './cad-viewport';
import styles from './CadViewer.module.css';

const fileLimit = 35 * 1024 * 1024;
const number = (value: number) => formatSmartNumber(value, 'tr-TR', 3);
const orientations = [
  { id: 'default', name: 'İzometrik' },
  { id: 'top', name: 'Üst' },
  { id: 'front', name: 'Ön' },
  { id: 'side', name: 'Yan' },
] as const;

export default function CadViewer() {
  const container = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const viewport = useRef<ReturnType<typeof createCadViewport> | null>(null);
  const worker = useRef<Worker | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const measuring = useRef(false);
  const loadId = useRef(0);
  const [model, setModel] = useState<CadModel | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [wantMeasure, setWantMeasure] = useState(false);
  const [points, setPoints] = useState<Coordinates[]>([]);
  const [extents, setExtents] = useState<Coordinates | null>(null);
  const [unit, setUnit] = useState<UnitId>('raw');

  useEffect(() => () => {
    loadId.current++;
    worker.current?.terminate();
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  useEffect(() => {
    if (!model || !container.current) return;
    const target = container.current;
    let cancelled = false;
    let view: ReturnType<typeof createCadViewport> | null = null;
    import('./cad-viewport').then(({ createCadViewport }) => {
      if (cancelled) return;
      view = createCadViewport(target, {
        model,
        isMeasuring: () => measuring.current,
        onPoint: point => setPoints(previous => previous.length === 1 ? [previous[0], point] : [point]),
      });
      viewport.current = view;
      setExtents(view.extents);
    }).catch(() => {
      if (!cancelled) setError('Çizim görüntülenemedi. WebGL 2 destekleyen bir tarayıcı kullanmayı dene.');
    });

    return () => {
      cancelled = true;
      view?.dispose();
      if (viewport.current === view) viewport.current = null;
    };
  }, [model]);

  useEffect(() => {
    viewport.current?.mark(points);
  }, [points]);

  function changeMode(value: boolean) {
    measuring.current = value;
    setWantMeasure(value);
  }

  async function load(file: File) {
    const id = ++loadId.current;
    worker.current?.terminate();
    worker.current = null;
    if (timeout.current) clearTimeout(timeout.current);
    setError('');
    setBusy(false);
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['dwg', 'step', 'stp'].includes(extension)) {
      setError('DWG, STEP veya STP uzantılı bir dosya seç.');
      return;
    }
    if (!file.size || file.size > fileLimit) {
      setError('Dosya boş veya 35 MB sınırını aşıyor.');
      return;
    }

    setName(file.name);
    setBusy(true);
    setModel(null);
    setExtents(null);
    setPoints([]);
    changeMode(false);

    function finish(message?: string) {
      if (id !== loadId.current) return;
      worker.current?.terminate();
      worker.current = null;
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = null;
      setBusy(false);
      if (message) setError(message);
    }

    try {
      const data = await file.arrayBuffer();
      if (id !== loadId.current) return;
      const isDwg = extension === 'dwg';
      const reader = isDwg
        ? new Worker('/cad-viewer/dwg.worker.js', { type: 'module' })
        : new Worker('/cad-viewer/step.worker.js');
      worker.current = reader;
      reader.onerror = () => finish('CAD okuyucu başlatılamadı veya dosya işlenemedi.');
      reader.onmessage = ({ data: response }: MessageEvent<CadModel | { error: string }>) => {
        if (id !== loadId.current) return;
        if ('error' in response) {
          finish(response.error);
          return;
        }
        finish();
        setUnit(drawingUnit(response));
        setModel(response);
      };
      timeout.current = setTimeout(() => finish('Dosya 60 saniye içinde çözümlenemedi.'), 60_000);
      reader.postMessage(data, [data]);
    } catch {
      finish('Dosya okunamadı.');
    }
  }

  function fit(direction?: Direction) {
    viewport.current?.fit(direction);
  }

  const selectedUnit = units.find(item => item.id === unit) ?? units[0];
  const multiplier = selectedUnit.factor;
  const outputUnit = unit === 'raw' ? 'çizim birimi' : 'mm';
  const difference = points.length === 2 ? points[1].map((coordinate, axis) => (coordinate - points[0][axis]) * multiplier) : null;
  const distance = difference ? Math.hypot(...difference) : null;

  return (
    <section className={styles.viewer} aria-label="CAD görüntüleme alanı">
      <input
        ref={picker}
        type="file"
        accept=".dwg,.step,.stp"
        className={styles.fileInput}
        aria-label="CAD dosyası seç"
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) void load(file);
          event.currentTarget.value = '';
        }}
      />
      <div className={styles.toolbar}>
        <button className={styles.open} type="button" onClick={() => picker.current?.click()}>
          <FileUp size={17} aria-hidden /> Dosya aç
        </button>
        <div className={styles.tools}>
          <button type="button" disabled={!extents} onClick={() => fit()}><Focus size={16} aria-hidden /> Sığdır</button>
          <button type="button" disabled={!extents} aria-pressed={wantMeasure} onClick={() => changeMode(!wantMeasure)}><Ruler size={16} aria-hidden /> Mesafe ölç</button>
          <button type="button" disabled={!points.length} onClick={() => setPoints([])}><RotateCcw size={15} aria-hidden /> Ölçüyü temizle</button>
        </div>
        {extents && model?.kind === 'step' && <label className={styles.unit}>Görünüş <select defaultValue="default" onChange={event => fit(event.target.value as Direction)}>
          {orientations.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
        </select></label>}
        {extents && model?.kind === 'dwg' && <label className={styles.unit}>DWG birimi <select value={unit} onChange={event => setUnit(event.target.value as UnitId)}>
          {units.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}
        </select></label>}
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div
        className={styles.stage}
        data-measuring={wantMeasure}
        data-dragging={dragging}
        onDragOver={event => { event.preventDefault(); setDragging(true); }}
        onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }}
        onDrop={event => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) void load(file);
        }}
      >
        <div className={styles.canvas} ref={container} />
        {!extents && <div className={styles.empty}>
          <Box size={35} aria-hidden />
          <strong>{busy ? 'Çizim açılıyor…' : model && !error ? 'Görüntü hazırlanıyor…' : 'DWG veya STEP dosyanı aç'}</strong>
          <span>{busy ? name : 'Dosya seç veya buraya sürükle. En fazla 35 MB.'}</span>
          {!busy && !model && <button type="button" onClick={() => picker.current?.click()}>Dosya seç</button>}
        </div>}
      </div>
      <div className={styles.status} aria-live="polite">
        {extents && <div><strong>{name}</strong><span>Boyutlar {extents.map(value => number(value * multiplier)).join(' × ')} {outputUnit}</span></div>}
        <div>
          <MousePointer2 size={16} aria-hidden />
          <span>{wantMeasure ? (points.length === 1 ? 'İkinci noktayı seç.' : 'İki nokta seçerek mesafeyi ölç.') : 'Yakınlaştırmak için kaydır. Çizimi taşımak için sağ tuşla sürükle.'}</span>
        </div>
        {difference && distance !== null && <div className={styles.measure}><strong>Mesafe {number(distance)} {outputUnit}</strong>
          <span>{difference.map((value, axis) => ['ΔX ', 'ΔY ', 'ΔZ '][axis] + number(value)).join(' · ')} {outputUnit}</span>
        </div>}
      </div>
      {extents && model?.kind === 'dwg' && model.omitted.length > 0 &&
        <p className={styles.notice}>Bu DWG’de gösterilmeyen nesneler var: {model.omitted.join(', ')}.</p>}
      {extents && model?.kind === 'step' &&
        <p className={styles.notice}>STEP mesafesi görüntülenen yüzey ağı üzerinden ölçülür. Eğri yüzeylerde yaklaşık sonuç verir.</p>}
    </section>
  );
}
