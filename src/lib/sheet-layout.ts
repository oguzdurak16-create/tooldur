export type SheetLayoutInput = {
  sheetWidth: number;
  sheetLength: number;
  partWidth: number;
  partLength: number;
  edge: number;
  gap: number;
  quantity: number;
  thickness: number;
  density: number;
  pricePerKg: number | null;
};

export function calculateSheetLayout(input: SheetLayoutInput) {
  const { sheetWidth, sheetLength, partWidth, partLength, edge, gap, quantity, thickness, density, pricePerKg } = input;
  const dimensions = [sheetWidth, sheetLength, partWidth, partLength, thickness, density];
  if (
    dimensions.some(value => !Number.isFinite(value) || value < 0.001 || value > 1_000_000) ||
    [edge, gap].some(value => !Number.isFinite(value) || value < 0 || value > 1_000_000) ||
    !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1_000_000 ||
    (pricePerKg !== null && (!Number.isFinite(pricePerKg) || pricePerKg < 0 || pricePerKg > 1_000_000))
  ) return null;

  const usableWidth = sheetWidth - 2 * edge;
  const usableLength = sheetLength - 2 * edge;
  if (usableWidth <= 0 || usableLength <= 0) return null;

  function countAlong(usable: number, part: number) {
    const ratio = (usable + gap) / (part + gap);
    return Math.floor(ratio + Number.EPSILON * Math.max(1, ratio));
  }

  const straight = {
    columns: countAlong(usableWidth, partWidth),
    rows: countAlong(usableLength, partLength),
  };
  const rotated = {
    columns: countAlong(usableWidth, partLength),
    rows: countAlong(usableLength, partWidth),
  };
  const straightCount = straight.columns * straight.rows;
  const rotatedCount = rotated.columns * rotated.rows;
  if (!Number.isSafeInteger(straightCount) || !Number.isSafeInteger(rotatedCount)) return null;

  const useRotated = rotatedCount > straightCount;
  const orientation = useRotated ? rotated : straight;
  const perSheet = Math.max(straightCount, rotatedCount);
  const sheets = perSheet > 0 ? Math.ceil(quantity / perSheet) : null;
  const areaPerSheet = sheetWidth * sheetLength;
  const partArea = partWidth * partLength;
  const utilization = Math.min(100, (perSheet * partArea / areaPerSheet) * 100);
  const orderUtilization = sheets ? Math.min(100, (quantity * partArea / (sheets * areaPerSheet)) * 100) : null;
  const sheetWeight = areaPerSheet * thickness * density / 1e9;
  const totalCost = sheets !== null && pricePerKg !== null ? sheets * sheetWeight * pricePerKg : null;

  return {
    perSheet, straightCount, rotatedCount, useRotated, ...orientation,
    sheets, utilization, orderUtilization, sheetWeight, totalCost,
    costPerPart: totalCost === null ? null : totalCost / quantity,
  };
}
