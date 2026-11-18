// SPDX-License-Identifier: GPL-3.0-only
import { Dwg_File_Type, LibreDwg } from '/cad-engine/dwg/dist/libredwg-web.js';

const tau = 2 * Math.PI;
const origin = { x: 0, y: 0, z: 0 };
const identity = point => point;
const xyz = (x, y, z = 0) => ({ x, y, z });
const add = (a, b) => xyz(a.x + b.x, a.y + b.y, (a.z ?? 0) + (b.z ?? 0));
const subtract = (a, b) => xyz(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
const scale = (p, factor) => xyz(p.x * factor, p.y * factor, (p.z ?? 0) * factor);
const cross = (a, b) => xyz(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
function normal(p) {
  const length = Math.hypot(p.x, p.y, p.z);
  return length > 0 ? scale(p, 1 / length) : xyz(0, 0, 1);
}

function ocsTransform(direction) {
  if (!direction) return identity;
  const z = normal(direction);
  const x = normal(cross(Math.abs(z.x) < 1 / 64 && Math.abs(z.y) < 1 / 64 ? xyz(0, 1) : xyz(0, 0, 1), z));
  const y = cross(z, x);
  return p => add(add(scale(x, p.x), scale(y, p.y)), scale(z, p.z ?? 0));
}

function sweepBetween(start, end) {
  const degrees = end - start;
  return degrees >= tau - 1e-10 ? tau : (degrees % tau + tau) % tau;
}

function drawingSegments(drawing) {
  const blocks = new Map((drawing.tables?.BLOCK_RECORD?.entries ?? []).map(block => [block.name.toLowerCase(), block]));
  const segments = [];
  const ignored = new Set();
  let visits = 0;

  function line(a, b, transform) {
    if (!a || !b) return;
    const p = transform(a);
    const q = transform(b);
    const coordinates = [p.x, p.y, p.z ?? 0, q.x, q.y, q.z ?? 0];
    if (coordinates.some(value => !Number.isFinite(value))) return;
    if (coordinates[0] === coordinates[3] && coordinates[1] === coordinates[4] && coordinates[2] === coordinates[5]) return;
    if (segments.length >= 250_000 * 6) throw new Error('DWG çiziminde tarayıcı sınırını aşan sayıda çizgi var.');
    segments.push(...coordinates);
  }

  function arc(at, start, sweep, transform) {
    if (!Number.isFinite(sweep) || Math.abs(sweep) < 1e-10) return;
    const count = Math.max(4, Math.ceil(Math.abs(sweep) / (Math.PI / 48)));
    let previous = at(start);
    for (let i = 1; i <= count; i++) {
      const point = at(start + (sweep * i) / count);
      line(previous, point, transform);
      previous = point;
    }
  }

  function polyline(entity, transform) {
    const vertices = entity.vertices ?? [];
    const is3d = entity.type === 'POLYLINE3D';
    const local = is3d ? identity : ocsTransform(entity.extrusionDirection);
    const mapped = p => transform(local(p));
    const count = (entity.flag & 1) ? vertices.length : vertices.length - 1;
    for (let i = 0; i < count; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % vertices.length];
      const z = is3d ? a.z : entity.elevation ?? 0;
      const p = xyz(a.x, a.y, z);
      const q = xyz(b.x, b.y, is3d ? b.z : z);
      if (is3d || !a.bulge || Math.abs(a.bulge) < 1e-10) {
        line(p, q, mapped);
        continue;
      }
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const offset = (1 - a.bulge ** 2) / (4 * a.bulge);
      const cx = (p.x + q.x) / 2 - dy * offset;
      const cy = (p.y + q.y) / 2 + dx * offset;
      const radius = Math.hypot(p.x - cx, p.y - cy);
      arc(angle => xyz(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle), z),
        Math.atan2(p.y - cy, p.x - cx), 4 * Math.atan(a.bulge), mapped);
    }
  }

  function visit(entities, transform, stack = []) {
    for (const entity of entities) {
      if (++visits > 600_000) throw new Error('DWG çizimindeki blok sayısı tarayıcı sınırını aşıyor.');
      if (entity.isVisible === false || entity.isInPaperSpace) continue;
      switch (entity.type) {
        case 'LINE':
          line(entity.startPoint, entity.endPoint, transform);
          break;
        case 'LWPOLYLINE':
        case 'POLYLINE2D':
        case 'POLYLINE3D':
          polyline(entity, transform);
          break;
        case 'ARC':
        case 'CIRCLE': {
          const local = ocsTransform(entity.extrusionDirection);
          const start = entity.startAngle ?? 0;
          arc(angle => add(entity.center, xyz(entity.radius * Math.cos(angle), entity.radius * Math.sin(angle))),
            start, entity.type === 'CIRCLE' ? tau : sweepBetween(start, entity.endAngle), p => transform(local(p)));
          break;
        }
        case 'ELLIPSE': {
          const major = entity.majorAxisEndPoint;
          const minor = scale(cross(normal(entity.extrusionDirection ?? xyz(0, 0, 1)), major), entity.axisRatio);
          arc(angle => add(entity.center, add(scale(major, Math.cos(angle)), scale(minor, Math.sin(angle)))),
            entity.startAngle, sweepBetween(entity.startAngle, entity.endAngle), transform);
          break;
        }
        case 'INSERT': {
          const name = entity.name?.toLowerCase();
          const block = blocks.get(name);
          if (!block || stack.includes(name) || stack.length >= 12) {
            ignored.add('BLOK');
            break;
          }
          const rotation = entity.rotation ?? 0;
          const cos = Math.cos(rotation);
          const sin = Math.sin(rotation);
          const local = ocsTransform(entity.extrusionDirection);
          const rows = Math.max(1, entity.rowCount ?? 1);
          const columns = Math.max(1, entity.columnCount ?? 1);
          if (rows * columns > 10000) throw new Error('DWG çizimindeki dizi bloğu fazla büyük.');
          for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
              const at = p => {
                const offset = subtract(p, block.basePoint ?? origin);
                const x = offset.x * (entity.xScale ?? 1) + column * (entity.columnSpacing ?? 0);
                const y = offset.y * (entity.yScale ?? 1) + row * (entity.rowSpacing ?? 0);
                return transform(local(add(entity.insertionPoint, xyz(x * cos - y * sin, x * sin + y * cos, offset.z * (entity.zScale ?? 1)))));
              };
              visit(block.entities, at, [...stack, name]);
            }
          }
          break;
        }
        default:
          ignored.add(entity.type);
      }
    }
  }

  visit(drawing.entities, identity);
  return { segments: new Float64Array(segments), omitted: [...ignored].sort() };
}

self.onmessage = async ({ data }) => {
  try {
    const engine = await LibreDwg.create(self.location.origin + '/cad-engine/dwg/wasm');
    const dwg = engine.dwg_read_data(data, Dwg_File_Type.DWG);
    if (!dwg || dwg === -1) throw new Error('DWG dosyası okunamadı.');
    let drawing;
    try {
      drawing = engine.convert(dwg);
    } finally {
      engine.dwg_free(dwg);
    }
    const { segments, omitted } = drawingSegments(drawing);
    if (!segments.length) throw new Error('Bu DWG’de desteklenen model alanı çizgileri bulunamadı. 3B katılar için STEP dosyası açabilirsin.');
    self.postMessage({ kind: 'dwg', segments, unit: drawing.header?.INSUNITS ?? 0, omitted }, [segments.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message || 'DWG dosyası açılamadı.' });
  }
};
