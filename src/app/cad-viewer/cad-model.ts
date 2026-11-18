export type CadMesh = {
  position: Float64Array;
  index: Uint32Array;
  normal?: Float32Array;
  color?: [number, number, number];
};

export type CadModel =
  | { kind: 'step'; meshes: CadMesh[] }
  | { kind: 'dwg'; segments: Float64Array; unit: number; omitted: string[] };

export type Coordinates = [number, number, number];

export const units = [
  { id: 'raw', label: 'Çizim birimi', factor: 1 },
  { id: 'mm', label: 'mm', factor: 1 },
  { id: 'cm', label: 'cm', factor: 10 },
  { id: 'm', label: 'm', factor: 1000 },
  { id: 'in', label: 'inç', factor: 25.4 },
  { id: 'ft', label: 'fit', factor: 304.8 },
] as const;

export type UnitId = typeof units[number]['id'];

export function drawingUnit(model: CadModel): UnitId {
  if (model.kind === 'step') return 'mm';
  const dwgUnits: Record<number, UnitId> = { 1: 'in', 2: 'ft', 4: 'mm', 5: 'cm', 6: 'm' };
  return dwgUnits[model.unit] ?? 'raw';
}
