'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Calculator,
  Droplets,
  Gauge,
  Info,
  Ruler,
  Scissors,
  ShieldCheck,
} from 'lucide-react';

type TabId = 'abkant' | 'kalip' | 'dizayn' | 'acinim' | 'giyotin' | 'hidrolik';

const MATERIALS = [
  {
    key: 'dkp',
    name: 'DKP / DC01',
    rm: 350,
    shear: 240,
    clearanceRatio: 0.055,
    radiusFactor: 0.16,
    note: 'Genel soğuk sac uygulamaları',
  },
  {
    key: 's235',
    name: 'S235 / St37',
    rm: 360,
    shear: 250,
    clearanceRatio: 0.06,
    radiusFactor: 0.16,
    note: 'Genel konstrüksiyon çeliği',
  },
  {
    key: 's275',
    name: 'S275 / St44',
    rm: 430,
    shear: 300,
    clearanceRatio: 0.065,
    radiusFactor: 0.16,
    note: 'Orta dayanımlı yapı çeliği',
  },
  {
    key: 's355',
    name: 'S355 / St52',
    rm: 510,
    shear: 360,
    clearanceRatio: 0.07,
    radiusFactor: 0.17,
    note: 'Yüksek dayanımlı konstrüksiyon çeliği',
  },
  {
    key: 'aisi304',
    name: 'AISI 304 Paslanmaz',
    rm: 700,
    shear: 500,
    clearanceRatio: 0.08,
    radiusFactor: 0.20,
    note: 'Paslanmaz sac; büküm ve kesme tonajı yüksek çıkar',
  },
  {
    key: 'al5754',
    name: 'Alüminyum 5754',
    rm: 220,
    shear: 150,
    clearanceRatio: 0.05,
    radiusFactor: 0.13,
    note: 'Alüminyum sac uygulamaları',
  },
] as const;

const V_FACTORS = [
  { value: '6', label: '6 × t — küçük radius / yüksek tonaj' },
  { value: '8', label: '8 × t — genel kullanım' },
  { value: '10', label: '10 × t — düşük tonaj / büyük radius' },
  { value: '12', label: '12 × t — kalın sac / geniş kalıp' },
];

const TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'abkant', label: 'Abkant Tonajı', icon: Gauge },
  { id: 'kalip', label: 'V Kalıp / Radius', icon: Ruler },
  { id: 'dizayn', label: 'Kalıp Tasarımı', icon: Ruler },
  { id: 'acinim', label: 'Açınım', icon: Calculator },
  { id: 'giyotin', label: 'Giyotin Kesme', icon: Scissors },
  { id: 'hidrolik', label: 'Hidrolik', icon: Droplets },
];

function parseNum(value: string | number | undefined | null) {
  if (value === undefined || value === null) return 0;

  const raw = String(value).trim();

  if (!raw) return 0;

  let normalized = raw;

  if (raw.includes(',') && raw.includes('.')) {
    normalized = raw.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = raw.replace(',', '.');
  }

  normalized = normalized.replace(/[^0-9.-]/g, '');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmt(value: number, digits = 2) {
  if (!Number.isFinite(value)) return '0';

  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export default function SacBukumKesimCalculator() {
  const [tab, setTab] = useState<TabId>('abkant');

  const [materialKey, setMaterialKey] = useState('s235');
  const [thickness, setThickness] = useState('3');
  const [bendLength, setBendLength] = useState('1000');
  const [vFactor, setVFactor] = useState('8');
  const [customV, setCustomV] = useState('');
  const [machineTon, setMachineTon] = useState('100');
  const [toolCapacityTonPerMeter, setToolCapacityTonPerMeter] = useState('100');
  const [safetyFactor, setSafetyFactor] = useState('1.15');

  const [bendAngle, setBendAngle] = useState('90');
  const [insideRadius, setInsideRadius] = useState('');
  const [kFactor, setKFactor] = useState('0.33');
  const [legA, setLegA] = useState('100');
  const [legB, setLegB] = useState('60');

  const [cutLength, setCutLength] = useState('1000');
  const [rakeAngle, setRakeAngle] = useState('2');
  const [shearCapacityTon, setShearCapacityTon] = useState('100');

  const [cylinderDiameter, setCylinderDiameter] = useState('125');
  const [rodDiameter, setRodDiameter] = useState('70');
  const [pressureBar, setPressureBar] = useState('250');
  const [cylinderCount, setCylinderCount] = useState('2');

  const material = MATERIALS.find((m) => m.key === materialKey) ?? MATERIALS[1];

  const hesap = useMemo(() => {
    const t = parseNum(thickness);
    const L = parseNum(bendLength);

    const autoV = t * (parseNum(vFactor) || 8);
    const manualV = parseNum(customV);
    const V = manualV > 0 ? manualV : autoV;

    const machine = parseNum(machineTon);
    const toolCapacity = parseNum(toolCapacityTonPerMeter);
    const sf = parseNum(safetyFactor) || 1.15;

    const angle = parseNum(bendAngle);
    const k = parseNum(kFactor) || 0.33;
    const radiusInput = parseNum(insideRadius);
    const ri = radiusInput > 0 ? radiusInput : V * material.radiusFactor;

    const A = parseNum(legA);
    const B = parseNum(legB);

    const cutL = parseNum(cutLength);
    const rake = parseNum(rakeAngle);
    const shearMachine = parseNum(shearCapacityTon);

    const D = parseNum(cylinderDiameter);
    const d = parseNum(rodDiameter);
    const pBar = parseNum(pressureBar);
    const n = parseNum(cylinderCount) || 1;

    const bendForceKn =
      t > 0 && L > 0 && V > 0
        ? (1.54 * material.rm * t * t * L) / (V * 1000)
        : 0;

    const bendForceTon = bendForceKn / 9.80665;
    const safeBendTon = bendForceTon * sf;
    const tonPerMeter = L > 0 ? bendForceTon / (L / 1000) : 0;
    const safeTonPerMeter = L > 0 ? safeBendTon / (L / 1000) : 0;
    const machineUse = machine > 0 ? (safeBendTon / machine) * 100 : 0;
    const toolLoadUse = toolCapacity > 0 ? (safeTonPerMeter / toolCapacity) * 100 : 0;

    const minFlange = V * 0.7;
    const suggestedRi = V * material.radiusFactor;
    const vRatio = t > 0 ? V / t : 0;

    const dieDesignRows = [6, 8, 10, 12].map((ratio) => {
      const designV = t * ratio;
      const designRi = designV * material.radiusFactor;
      const designMinFlange = designV * 0.7;

      const designForceKn =
        t > 0 && L > 0 && designV > 0
          ? (1.54 * material.rm * t * t * L) / (designV * 1000)
          : 0;

      const designForceTon = designForceKn / 9.80665;
      const designSafeForceTon = designForceTon * sf;

      return {
        ratio,
        designV,
        designRi,
        designMinFlange,
        designForceTon,
        designSafeForceTon,
      };
    });

    const recommendedDieRatio =
      t <= 0 ? 8 : t <= 1.5 ? 6 : t <= 6 ? 8 : t <= 10 ? 10 : 12;

    const recommendedDesignV = t * recommendedDieRatio;
    const recommendedDesignRi = recommendedDesignV * material.radiusFactor;
    const recommendedMinFlange = recommendedDesignV * 0.7;

    const recommendedForceKn =
      t > 0 && L > 0 && recommendedDesignV > 0
        ? (1.54 * material.rm * t * t * L) / (recommendedDesignV * 1000)
        : 0;

    const recommendedForceTon = recommendedForceKn / 9.80665;
    const recommendedSafeForceTon = recommendedForceTon * sf;
    const recommendedSafeTonPerMeter = L > 0 ? recommendedSafeForceTon / (L / 1000) : 0;
    const recommendedToolLoadUse = toolCapacity > 0 ? (recommendedSafeTonPerMeter / toolCapacity) * 100 : 0;
    const recommendedToolLoadOk = toolCapacity > 0 && recommendedSafeTonPerMeter <= toolCapacity;

    const punchRadiusMin = t > 0 ? Math.min(Math.max(t * 0.5, 0.5), recommendedDesignRi) : 0;
    const punchRadiusMax = t > 0 ? Math.max(punchRadiusMin, Math.min(t * 1.5, recommendedDesignRi)) : 0;
    const lowerDieShoulderRadiusMin = t > 0 ? Math.max(t * 0.5, 0.5) : 0;
    const lowerDieShoulderRadiusMax = t > 0 ? Math.max(t, lowerDieShoulderRadiusMin) : 0;
    const suggestedBladeClearance = t * material.clearanceRatio;

    const angleRad = (angle * Math.PI) / 180;

    const bendAllowance =
      angle > 0 && angle < 180 && t > 0
        ? angleRad * (ri + k * t)
        : 0;

    const outsideSetback =
      angle > 0 && angle < 180 && t > 0
        ? Math.tan(angleRad / 2) * (ri + t)
        : 0;

    const bendDeduction = 2 * outsideSetback - bendAllowance;
    const flatLength = A > 0 && B > 0 ? A + B - bendDeduction : 0;

    const straightShearKn =
      material.shear > 0 && t > 0 && cutL > 0
        ? (material.shear * t * cutL) / 1000
        : 0;

    const rakeRad = (rake * Math.PI) / 180;

    const effectiveCutLength =
      rake > 0 && t > 0 && Math.tan(rakeRad) > 0
        ? Math.min(cutL, t / Math.tan(rakeRad))
        : cutL;

    const rakeShearKn =
      material.shear > 0 && t > 0 && effectiveCutLength > 0
        ? (material.shear * t * effectiveCutLength) / 1000
        : straightShearKn;

    const straightShearTon = straightShearKn / 9.80665;
    const rakeShearTon = rakeShearKn / 9.80665;
    const shearSafeTon = rakeShearTon * sf;
    const shearUse = shearMachine > 0 ? (shearSafeTon / shearMachine) * 100 : 0;
    const bladeClearance = t * material.clearanceRatio;

    const pistonArea = D > 0 ? (Math.PI * D * D) / 4 : 0;
    const rodArea = d > 0 ? (Math.PI * d * d) / 4 : 0;
    const annularArea = Math.max(pistonArea - rodArea, 0);
    const pressureMpa = pBar * 0.1;

    const pushKn = (pressureMpa * pistonArea * n) / 1000;
    const pullKn = (pressureMpa * annularArea * n) / 1000;
    const pushTon = pushKn / 9.80665;
    const pullTon = pullKn / 9.80665;

    return {
      t,
      L,
      V,
      sf,

      bendForceKn,
      bendForceTon,
      safeBendTon,
      tonPerMeter,
      safeTonPerMeter,
      machine,
      machineUse,
      machineOk: machine > 0 && safeBendTon <= machine,
      toolCapacity,
      toolLoadUse,

      minFlange,
      suggestedRi,
      vRatio,

      dieDesignRows,
      recommendedDieRatio,
      recommendedDesignV,
      recommendedDesignRi,
      recommendedMinFlange,
      recommendedForceTon,
      recommendedSafeForceTon,
      recommendedSafeTonPerMeter,
      recommendedToolLoadUse,
      recommendedToolLoadOk,
      punchRadiusMin,
      punchRadiusMax,
      lowerDieShoulderRadiusMin,
      lowerDieShoulderRadiusMax,
      suggestedBladeClearance,

      angle,
      k,
      ri,
      bendAllowance,
      outsideSetback,
      bendDeduction,
      flatLength,

      cutL,
      effectiveCutLength,
      straightShearTon,
      rakeShearTon,
      shearSafeTon,
      shearMachine,
      shearUse,
      shearOk: shearMachine > 0 && shearSafeTon <= shearMachine,
      bladeClearance,

      D,
      d,
      pBar,
      n,
      pistonArea,
      annularArea,
      pushKn,
      pullKn,
      pushTon,
      pullTon,
    };
  }, [
    thickness,
    bendLength,
    vFactor,
    customV,
    machineTon,
    toolCapacityTonPerMeter,
    safetyFactor,
    bendAngle,
    insideRadius,
    kFactor,
    legA,
    legB,
    cutLength,
    rakeAngle,
    shearCapacityTon,
    cylinderDiameter,
    rodDiameter,
    pressureBar,
    cylinderCount,
    material,
  ]);

  const materialOptions = MATERIALS.map((m) => ({
    value: m.key,
    label: `${m.name} — Rm ${m.rm} MPa`,
  }));

  return (
    <div className="space-y-6">
      <section className="calc-panel rounded-2xl p-5 md:p-6 border border-[var(--border)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold mb-3">
              <Gauge size={15} />
              Sac imalat ön hesap aracı
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Sac Büküm ve Kesim Hesaplayıcı
            </h2>

            <p className="mt-2 text-sm md:text-base text-[var(--muted-foreground)] max-w-3xl">
              Abkant tonajı, V kalıp seçimi, kalıp ön tasarım bilgisi, sac açınımı,
              giyotin kesme kuvveti ve hidrolik silindir kuvvetini tek ekranda hesaplayın.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs min-w-[260px]">
            <Badge label="Abkant" value="Tonaj hesabı" />
            <Badge label="Kalıp" value="V açıklığı + radius" />
            <Badge label="Giyotin" value="Kesme kuvveti" />
            <Badge label="Hidrolik" value="Silindir kuvveti" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mt-6">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`h-12 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  active
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20'
                    : 'calc-panel text-[var(--foreground)] border-[var(--border)] hover:border-amber-500/40'
                }`}
              >
                <Icon size={17} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-5">
        <section className="calc-panel rounded-2xl p-5 md:p-6 border border-[var(--border)]">
          {tab === 'abkant' && (
            <div className="space-y-5">
              <PanelTitle
                icon={<Gauge size={20} />}
                title="Abkant büküm tonajı"
                desc="Malzeme, kalınlık, büküm boyu ve V açıklığına göre yaklaşık büküm kuvveti."
              />

              <div className="grid md:grid-cols-2 gap-4">
                <SelectField
                  label="Malzeme"
                  value={materialKey}
                  onChange={setMaterialKey}
                  options={materialOptions}
                />
                <InputField label="Sac kalınlığı t (mm)" value={thickness} onChange={setThickness} />
                <InputField label="Büküm boyu L (mm)" value={bendLength} onChange={setBendLength} />
                <SelectField
                  label="Otomatik V açıklığı"
                  value={vFactor}
                  onChange={setVFactor}
                  options={V_FACTORS}
                />
                <InputField
                  label="Manuel V açıklığı (mm)"
                  value={customV}
                  onChange={setCustomV}
                  placeholder="Boş bırakılırsa otomatik"
                />
                <InputField label="Makine kapasitesi (ton)" value={machineTon} onChange={setMachineTon} />
                <InputField
                  label="Kalıp izin verilen yükü (ton/m)"
                  value={toolCapacityTonPerMeter}
                  onChange={setToolCapacityTonPerMeter}
                />
                <InputField label="Güvenlik katsayısı" value={safetyFactor} onChange={setSafetyFactor} />
              </div>

              <Notice>
                Manuel V açıklığı boşsa program otomatik olarak <b>{vFactor} × t</b> kullanır.
                V açıklığı büyüdükçe tonaj düşer; iç radius ve minimum flanş büyür.
              </Notice>
            </div>
          )}

          {tab === 'kalip' && (
            <div className="space-y-5">
              <PanelTitle
                icon={<Ruler size={20} />}
                title="V kalıp ve iç radius seçimi"
                desc="Sac kalınlığına göre V kalıp, tahmini iç radius ve minimum flanş kontrolü."
              />

              <div className="grid md:grid-cols-2 gap-4">
                <SelectField
                  label="Malzeme"
                  value={materialKey}
                  onChange={setMaterialKey}
                  options={materialOptions}
                />
                <InputField label="Sac kalınlığı t (mm)" value={thickness} onChange={setThickness} />
                <SelectField label="V kalıp oranı" value={vFactor} onChange={setVFactor} options={V_FACTORS} />
                <InputField
                  label="Manuel V açıklığı (mm)"
                  value={customV}
                  onChange={setCustomV}
                  placeholder="Örn. 32"
                />
                <InputField label="Büküm boyu L (mm)" value={bendLength} onChange={setBendLength} />
                <InputField label="Makine kapasitesi (ton)" value={machineTon} onChange={setMachineTon} />
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <SmallInfo title="6 × t" text="Küçük radius, yüksek tonaj." />
                <SmallInfo title="8 × t" text="Genel kullanım için başlangıç." />
                <SmallInfo title="10–12 × t" text="Tonajı düşürür, radius büyür." />
              </div>
            </div>
          )}

          {tab === 'dizayn' && (
            <div className="space-y-5">
              <PanelTitle
                icon={<Ruler size={20} />}
                title="Sac kalınlığına göre kalıp tasarımı"
                desc="Sac kalınlığı ve malzemeye göre V açıklığı, punch radiusu, alt kalıp omuz radiusu, flanş ve tonaj ön bilgileri."
              />

              <div className="grid md:grid-cols-2 gap-4">
                <SelectField
                  label="Malzeme"
                  value={materialKey}
                  onChange={setMaterialKey}
                  options={materialOptions}
                />
                <InputField label="Sac kalınlığı t (mm)" value={thickness} onChange={setThickness} />
                <InputField label="Referans büküm boyu L (mm)" value={bendLength} onChange={setBendLength} />
                <InputField label="Makine kapasitesi (ton)" value={machineTon} onChange={setMachineTon} />
                <InputField
                  label="Kalıp izin verilen yükü (ton/m)"
                  value={toolCapacityTonPerMeter}
                  onChange={setToolCapacityTonPerMeter}
                />
                <InputField label="Güvenlik katsayısı" value={safetyFactor} onChange={setSafetyFactor} />
              </div>

              <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)] font-black">
                  V Kalıp Alternatifleri
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-[var(--muted-foreground)]">
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left p-3">Oran</th>
                        <th className="text-left p-3">V Açıklığı</th>
                        <th className="text-left p-3">Tahmini Ri</th>
                        <th className="text-left p-3">Min. Flanş</th>
                        <th className="text-left p-3">Emniyetli Tonaj (L)</th>
                        <th className="text-left p-3">Kullanım</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hesap.dieDesignRows.map((row) => (
                        <tr
                          key={row.ratio}
                          className="border-b border-[var(--border)] last:border-b-0"
                        >
                          <td className="p-3 font-black">{row.ratio} × t</td>
                          <td className="p-3">{fmt(row.designV, 1)} mm</td>
                          <td className="p-3">{fmt(row.designRi, 2)} mm</td>
                          <td className="p-3">{fmt(row.designMinFlange, 1)} mm</td>
                          <td className="p-3">{fmt(row.designSafeForceTon, 1)} ton</td>
                          <td className="p-3 text-[var(--muted-foreground)]">
                            {row.ratio === 6 && 'Küçük radius / yüksek tonaj'}
                            {row.ratio === 8 && 'Genel kullanım'}
                            {row.ratio === 10 && 'Düşük tonaj / büyük radius'}
                            {row.ratio === 12 && 'Kalın sac / geniş radius'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Notice>
                Bu sekme 90° air bending için ön seçim bilgisi verir. Kalıp yüksekliği, taban genişliği,
                kanal derinliği ve gövde et kalınlığı yalnız sac kalınlığından belirlenemez; kalıp boyu,
                izin verilen ton/metre yükü, takım çeliği, ısıl işlem, bağlama standardı ve kesit hesabı birlikte doğrulanmalıdır.
              </Notice>
            </div>
          )}

          {tab === 'acinim' && (
            <div className="space-y-5">
              <PanelTitle
                icon={<Calculator size={20} />}
                title="Sac büküm açınım hesabı"
                desc="İki kenarlı büküm için BA, BD ve yaklaşık düz boy hesabı."
              />

              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="A kenarı dış ölçü (mm)" value={legA} onChange={setLegA} />
                <InputField label="B kenarı dış ölçü (mm)" value={legB} onChange={setLegB} />
                <InputField label="Sac kalınlığı t (mm)" value={thickness} onChange={setThickness} />
                <InputField label="Büküm açısı (°)" value={bendAngle} onChange={setBendAngle} />
                <InputField
                  label="İç radius Ri (mm)"
                  value={insideRadius}
                  onChange={setInsideRadius}
                  placeholder="Boşsa malzemeye göre V oranı alınır"
                />
                <InputField label="K faktörü" value={kFactor} onChange={setKFactor} />
                <SelectField label="V kalıp oranı" value={vFactor} onChange={setVFactor} options={V_FACTORS} />
                <InputField
                  label="Manuel V açıklığı (mm)"
                  value={customV}
                  onChange={setCustomV}
                  placeholder="Boş bırakılabilir"
                />
              </div>

              <Notice>
                İç radius boş bırakılırsa malzemeye bağlı yaklaşık doğal air-bending radiusu kullanılır.
                Hassas açınım için gerçek kalıp, büküm testi ve firma büküm tablosu esas alınmalıdır.
              </Notice>
            </div>
          )}

          {tab === 'giyotin' && (
            <div className="space-y-5">
              <PanelTitle
                icon={<Scissors size={20} />}
                title="Giyotin kesme kuvveti"
                desc="Sac kalınlığı, kesme boyu, malzeme ve bıçak açısına göre yaklaşık kesme tonajı."
              />

              <div className="grid md:grid-cols-2 gap-4">
                <SelectField
                  label="Malzeme"
                  value={materialKey}
                  onChange={setMaterialKey}
                  options={materialOptions}
                />
                <InputField label="Sac kalınlığı t (mm)" value={thickness} onChange={setThickness} />
                <InputField label="Kesme boyu L (mm)" value={cutLength} onChange={setCutLength} />
                <InputField label="Bıçak açısı / rake angle (°)" value={rakeAngle} onChange={setRakeAngle} />
                <InputField label="Giyotin kapasitesi (ton)" value={shearCapacityTon} onChange={setShearCapacityTon} />
                <InputField label="Güvenlik katsayısı" value={safetyFactor} onChange={setSafetyFactor} />
              </div>

              <Notice>
                Açılı bıçakta aynı anda kesilen efektif boy azaldığı için anlık kuvvet düşer.
                Bu hesap ön seçim içindir; bıçak boşluğu, sac tutucu, kesme kalitesi ve makine rijitliği ayrıca kontrol edilmelidir.
              </Notice>
            </div>
          )}

          {tab === 'hidrolik' && (
            <div className="space-y-5">
              <PanelTitle
                icon={<Droplets size={20} />}
                title="Hidrolik silindir kuvveti"
                desc="Silindir çapı, mil çapı, basınç ve silindir adedine göre itme/çekme kuvveti."
              />

              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Silindir çapı D (mm)" value={cylinderDiameter} onChange={setCylinderDiameter} />
                <InputField label="Mil çapı d (mm)" value={rodDiameter} onChange={setRodDiameter} />
                <InputField label="Basınç P (bar)" value={pressureBar} onChange={setPressureBar} />
                <InputField label="Silindir adedi" value={cylinderCount} onChange={setCylinderCount} />
              </div>

              <Notice>
                İtme kuvvetinde piston tam alanı, çekme kuvvetinde mil alanı düşülmüş halka alanı kullanılır.
              </Notice>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          {tab === 'abkant' && (
            <ResultBox
              title="Abkant Sonucu"
              status={hesap.machineOk ? 'Makine uygun' : 'Kapasite kontrol et'}
              ok={hesap.machineOk}
              main={`${fmt(hesap.safeBendTon, 1)} ton`}
              sub={`Emniyetli tonaj · çıplak hesap ${fmt(hesap.bendForceTon, 1)} ton`}
              metrics={[
                ['Kuvvet', `${fmt(hesap.bendForceKn, 1)} kN`],
                ['Ton / metre', `${fmt(hesap.tonPerMeter, 1)} ton/m`],
                ['Emniyetli ton / metre', `${fmt(hesap.safeTonPerMeter, 1)} ton/m`],
                ['V açıklığı', `${fmt(hesap.V, 1)} mm`],
                ['Makine kullanımı', `%${fmt(hesap.machineUse, 1)}`],
                ['Tahmini Ri', `${fmt(hesap.suggestedRi, 2)} mm`],
                ['Min. flanş', `${fmt(hesap.minFlange, 1)} mm`],
              ]}
              formula="F(kN) = 1.54 × Rm × t² × L / (V × 1000)"
              warning={
                hesap.vRatio < 6
                  ? 'V/t oranı düşük. Tonaj artar, kalıp ve punch izi riski yükselir.'
                  : hesap.vRatio > 12
                    ? 'V/t oranı yüksek. Tonaj düşer fakat radius ve minimum flanş büyür.'
                    : ''
              }
            />
          )}

          {tab === 'kalip' && (
            <ResultBox
              title="V Kalıp Özeti"
              status={hesap.vRatio >= 6 && hesap.vRatio <= 12 ? 'Normal aralık' : 'Kontrol gerekli'}
              ok={hesap.vRatio >= 6 && hesap.vRatio <= 12}
              main={`V ${fmt(hesap.V, 1)} mm`}
              sub={`${fmt(hesap.vRatio, 1)} × t oranı`}
              metrics={[
                ['Sac kalınlığı', `${fmt(hesap.t, 2)} mm`],
                ['Tahmini iç radius', `${fmt(hesap.suggestedRi, 2)} mm`],
                ['Minimum flanş', `${fmt(hesap.minFlange, 1)} mm`],
                ['Gerekli tonaj', `${fmt(hesap.safeBendTon, 1)} ton`],
                ['Malzeme Rm', `${material.rm} MPa`],
                ['Malzeme notu', material.note],
              ]}
              formula="Ri ≈ malzeme katsayısı × V · minimum flanş ≈ 0.7 × V"
              warning="Katalog değerleri, punch ucu, sac yönü ve gerçek geri yaylanma sonucu değiştirebilir."
            />
          )}

          {tab === 'dizayn' && (
            <ResultBox
              title="Kalıp Tasarımı Özeti"
              status={hesap.recommendedToolLoadOk ? 'Kalıp yükü uygun' : 'Kalıp kapasitesini kontrol et'}
              ok={hesap.recommendedToolLoadOk}
              main={`V ${fmt(hesap.recommendedDesignV, 1)} mm`}
              sub={`${fmt(hesap.t, 2)} mm sac için önerilen başlangıç V açıklığı`}
              metrics={[
                ['Önerilen oran', `${hesap.recommendedDieRatio} × t`],
                ['Tahmini iç radius', `${fmt(hesap.recommendedDesignRi, 2)} mm`],
                ['Minimum flanş', `${fmt(hesap.recommendedMinFlange, 1)} mm`],
                ['Emniyetli tonaj', `${fmt(hesap.recommendedSafeForceTon, 1)} ton`],
                ['Gerekli kalıp yükü', `${fmt(hesap.recommendedSafeTonPerMeter, 1)} ton/m`],
                ['Kalıp kapasite kullanımı', `%${fmt(hesap.recommendedToolLoadUse, 1)}`],
                ['Punch uç R aralığı', `${fmt(hesap.punchRadiusMin, 1)} - ${fmt(hesap.punchRadiusMax, 1)} mm`],
                ['Alt kalıp omuz R', `${fmt(hesap.lowerDieShoulderRadiusMin, 1)} - ${fmt(hesap.lowerDieShoulderRadiusMax, 1)} mm`],
                ['Gövde et kalınlığı', 'Kesit hesabı / FEA ile'],
                ['Kalıp yüksekliği', 'Makine standardına göre'],
                ['Giyotin bıçak boşluğu', `${fmt(hesap.suggestedBladeClearance, 3)} mm / taraf`],
              ]}
              formula="V ≈ 6t–12t · Ri ≈ kᵣ × V · min flanş ≈ 0.7V"
              warning="Bu değerler 90° air bending için başlangıç verir. Kalıp gövdesi, tabanı ve yüksekliği; gerçek takım kapasitesi, kesit gerilmesi, takım çeliği, ısıl işlem ve bağlama standardı doğrulanmadan imalata verilmemelidir."
            />
          )}

          {tab === 'acinim' && (
            <ResultBox
              title="Açınım Sonucu"
              status="Ön açınım"
              ok
              main={`${fmt(hesap.flatLength, 2)} mm`}
              sub="Yaklaşık düz boy"
              metrics={[
                ['Büküm payı BA', `${fmt(hesap.bendAllowance, 3)} mm`],
                ['Büküm düşümü BD', `${fmt(hesap.bendDeduction, 3)} mm`],
                ['Dış setback OSS', `${fmt(hesap.outsideSetback, 3)} mm`],
                ['K faktörü', `${fmt(hesap.k, 2)}`],
                ['İç radius', `${fmt(hesap.ri, 2)} mm`],
                ['Açı', `${fmt(hesap.angle, 1)}°`],
              ]}
              formula="BA = α × (Ri + K × t) · BD = 2 × OSS - BA"
              warning="Açınım sonucu üretim ön hesabıdır. Seri imalatta numune bükümle düzeltme yapılmalıdır."
            />
          )}

          {tab === 'giyotin' && (
            <ResultBox
              title="Giyotin Sonucu"
              status={hesap.shearOk ? 'Makine uygun' : 'Kapasite kontrol et'}
              ok={hesap.shearOk}
              main={`${fmt(hesap.shearSafeTon, 1)} ton`}
              sub={`Emniyetli kesme tonajı · açısız ${fmt(hesap.straightShearTon, 1)} ton`}
              metrics={[
                ['Bıçak açılı tonaj', `${fmt(hesap.rakeShearTon, 1)} ton`],
                ['Efektif kesme boyu', `${fmt(hesap.effectiveCutLength, 1)} mm`],
                ['Kesme dayanımı', `${material.shear} MPa`],
                ['Önerilen boşluk', `${fmt(hesap.bladeClearance, 3)} mm / taraf`],
                ['Makine kullanımı', `%${fmt(hesap.shearUse, 1)}`],
                ['Malzeme', material.name],
              ]}
              formula="F = τ × t × L · açılı bıçakta Leff = min(L, t / tanθ)"
              warning="Bıçak boşluğu yanlışsa çapak, eğilme, kesme sesi ve bıçak aşınması artar."
            />
          )}

          {tab === 'hidrolik' && (
            <ResultBox
              title="Hidrolik Sonuç"
              status="Silindir kuvveti"
              ok
              main={`${fmt(hesap.pushTon, 1)} ton`}
              sub="Toplam itme kuvveti"
              metrics={[
                ['İtme kuvveti', `${fmt(hesap.pushKn, 1)} kN`],
                ['Çekme kuvveti', `${fmt(hesap.pullKn, 1)} kN`],
                ['Çekme tonajı', `${fmt(hesap.pullTon, 1)} ton`],
                ['Piston alanı', `${fmt(hesap.pistonArea, 0)} mm²`],
                ['Halka alanı', `${fmt(hesap.annularArea, 0)} mm²`],
                ['Basınç', `${fmt(hesap.pBar, 0)} bar`],
              ]}
              formula="F = P × A × n · P(bar) × 0.1 = MPa = N/mm²"
              warning="Pompa debisi, hız, hortum kayıpları, valf kapasitesi ve mekanik kayıplar bu hesaba dahil değildir."
            />
          )}
        </aside>
      </div>

      <section className="calc-panel rounded-2xl p-5 md:p-6 border border-[var(--border)]">
        <div className="flex items-start gap-3">
          <Info className="text-amber-500 mt-0.5" size={20} />
          <div>
            <h3 className="font-black text-lg">Kullanım notu</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-6">
              Bu araç sac büküm, kesim, kalıp ön tasarımı ve hidrolik sistemler için hızlı ön hesap verir.
              Sonuçlar 90° air bending ve ön kesme hesabı içindir; bottoming/coining hesabı değildir. Gerçek üretimde
              malzeme sertifikası, kalıp kataloğu, takımın izin verilen ton/metre yükü, punch radiusu, makine üretici tablosu,
              sac yönü, geri yaylanma, bıçak boşluğu ve güvenlik katsayısı ayrıca kontrol edilmelidir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function PanelTitle({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-black">{title}</h3>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">{desc}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[var(--foreground)]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        placeholder={placeholder}
        inputMode="decimal"
        className="calc-panel w-full mt-2 px-4 h-12 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 border border-[var(--border)]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[var(--foreground)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="calc-panel w-full mt-2 px-4 h-12 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 border border-[var(--border)]"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="calc-panel rounded-xl px-3 py-2 border border-[var(--border)]">
      <div className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-bold">
        {label}
      </div>
      <div className="text-xs font-black mt-1">{value}</div>
    </div>
  );
}

function SmallInfo({ title, text }: { title: string; text: string }) {
  return (
    <div className="calc-panel rounded-xl p-4 border border-[var(--border)]">
      <div className="font-black text-amber-500">{title}</div>
      <p className="text-sm text-[var(--muted-foreground)] mt-1">{text}</p>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-[var(--foreground)] leading-6">
      <div className="flex gap-2">
        <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>{children}</div>
      </div>
    </div>
  );
}

function ResultBox({
  title,
  status,
  ok,
  main,
  sub,
  metrics,
  formula,
  warning,
}: {
  title: string;
  status: string;
  ok: boolean;
  main: string;
  sub: string;
  metrics: Array<[string, string]>;
  formula: string;
  warning?: string;
}) {
  return (
    <section className="calc-panel rounded-2xl p-5 md:p-6 border border-[var(--border)] lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[var(--muted-foreground)]">{title}</div>
          <div className="text-3xl md:text-4xl font-black mt-2 tracking-tight">{main}</div>
          <div className="text-sm text-[var(--muted-foreground)] mt-1">{sub}</div>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${
            ok
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-amber-500/10 text-amber-500'
          }`}
        >
          {ok ? <ShieldCheck size={15} /> : <AlertTriangle size={15} />}
          {status}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[var(--border)] p-3">
            <div className="text-xs text-[var(--muted-foreground)] font-bold">{label}</div>
            <div className="text-base font-black mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-950 text-slate-100 p-4 mt-5 overflow-x-auto">
        <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold mb-1">
          Formül
        </div>
        <code className="text-sm font-semibold whitespace-pre-wrap">{formula}</code>
      </div>

      {warning && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 mt-4 text-sm leading-6">
          <div className="flex gap-2">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>{warning}</div>
          </div>
        </div>
      )}
    </section>
  );
}