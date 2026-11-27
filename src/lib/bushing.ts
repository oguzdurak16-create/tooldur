type Motion =
  | { kind: 'static' }
  | { kind: 'rotation'; rpm: number }
  | { kind: 'oscillation'; angle: number; cyclesPerMinute: number; movingSeconds?: number };

export function calculateBushingLoad(
  forceN: number,
  diameter: number,
  length: number,
  motion: Motion,
) {
  if (![forceN, diameter, length].every(value => Number.isFinite(value) && value > 0)) return null;

  const area = diameter * length;
  const pressure = forceN / area;
  const circumference = Math.PI * diameter / 1000;
  let speed = 0;
  let movingSpeed: number | null = null;

  if (motion.kind === 'rotation') {
    if (!Number.isFinite(motion.rpm) || motion.rpm <= 0) return null;
    speed = circumference * motion.rpm / 60;
  }
  if (motion.kind === 'oscillation') {
    const { angle, cyclesPerMinute, movingSeconds } = motion;
    if (!Number.isFinite(angle) || angle <= 0 || angle > 360 ||
        !Number.isFinite(cyclesPerMinute) || cyclesPerMinute <= 0) return null;
    const travel = circumference * 2 * angle / 360;
    speed = travel * cyclesPerMinute / 60;
    if (movingSeconds !== undefined) {
      if (!Number.isFinite(movingSeconds) || movingSeconds <= 0 || movingSeconds > 60 / cyclesPerMinute) return null;
      movingSpeed = travel / movingSeconds;
    }
  }

  const pv = pressure * speed;
  const movingPv = movingSpeed === null ? null : pressure * movingSpeed;
  if (![area, pressure, speed, pv, movingSpeed ?? 0, movingPv ?? 0].every(Number.isFinite) ||
      area <= 0 || pressure <= 0) return null;
  return { area, pressure, speed, pv, movingSpeed, movingPv };
}

export function calculateBushingClearance(boreMin: number, boreMax: number, shaftMin: number, shaftMax: number) {
  if (![boreMin, boreMax, shaftMin, shaftMax].every(value => Number.isFinite(value) && value > 0) ||
      boreMin > boreMax || shaftMin > shaftMax) return null;
  return { min: boreMin - shaftMax, max: boreMax - shaftMin };
}
