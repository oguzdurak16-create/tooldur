export function calculateMilling(diameter: number, cuttingSpeed: number, teeth: number, chipLoad: number) {
  if (![diameter, cuttingSpeed, teeth, chipLoad].every(Number.isFinite) || diameter <= 0 || cuttingSpeed <= 0 || chipLoad <= 0 || !Number.isInteger(teeth) || teeth < 1) throw new RangeError('Pozitif çap, kesme hızı, diş başına ilerleme ve tam sayı diş adedi girin.');
  const rpm = 1000 * cuttingSpeed / (Math.PI * diameter);
  const feed = rpm * teeth * chipLoad;
  if (![rpm, feed, teeth * chipLoad].every(Number.isFinite)) throw new RangeError('Değerler hesaplama aralığını aşıyor.');
  return { rpm, feed, feedPerRevolution: teeth * chipLoad };
}
