import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const calcDir = path.join(root, 'src', 'components', 'calculators');
const fullOutPath = path.join(root, 'public', '__calculator_audit.json');
const compactOutPath = path.join(root, 'public', '__calculator_audit_compact.json');

const files = fs.readdirSync(calcDir)
  .filter((name) => name.endsWith('.tsx'))
  .sort((a, b) => a.localeCompare(b));

const interesting = /Math\.|parseLocalizedNumber|toFixed|ISO\s?\d*|EN\s?\d*|ASTM|AWS|Barlow|Reynolds|OEE|Takt|molar|emisyon|emission|formül|formula|STANDARD|SERISI|MALZEME|density|yogunluk|gerilme|akma|verim|efficien|factor|katsay|kapasite|capacity|tolerance|tolerans|pitch|hatve|diameter|çap|basınç|pressure|voltage|gerilim|current|akım|kW|MPa|Nm|rpm|kg\/m|m³|cm²|mm²/i;
const expressionLike = /(?:const|let)\s+[A-Za-z_$][\w$]*\s*=.*(?:\+|\-|\*|\/|Math\.|\?)/;
const commentOnly = /^\s*(?:\/\/|\/\*|\*|\*\/)/;

const calculators = files.map((file) => {
  const fullPath = path.join(calcDir, file);
  const source = fs.readFileSync(fullPath, 'utf8');
  const lines = source.split(/\r?\n/);
  const excerpts = lines
    .map((text, index) => ({ line: index + 1, text: text.trim() }))
    .filter(({ text }) => text && !commentOnly.test(text) && (interesting.test(text) || expressionLike.test(text)))
    .slice(0, 180);

  const base = {
    file,
    bytes: Buffer.byteLength(source),
    sha256: crypto.createHash('sha256').update(source).digest('hex'),
    hardcodedTurkishLocaleCount: (source.match(/['\"]tr-TR['\"]/g) || []).length,
    localizedNumberParsingCount: (source.match(/parseLocalizedNumber/g) || []).length,
    mathOperationCount: (source.match(/Math\./g) || []).length,
    hasUseMemo: source.includes('useMemo'),
    hasInputValidation: /Number\.isNaN|<=\s*0|>\s*100|return null|return;/.test(source),
    standardsMentioned: [...new Set((source.match(/\b(?:ISO|EN|ASTM|AWS|DIN|IEC|API|ASME)\s?[A-Za-z0-9.-]*/g) || []))],
    excerpts,
  };
  return { ...base, source };
});

fs.writeFileSync(fullOutPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  calculatorCount: calculators.length,
  calculators,
}));

fs.writeFileSync(compactOutPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  calculatorCount: calculators.length,
  calculators: calculators.map(({ source, ...item }) => item),
}));

console.log(`[calculator-audit] wrote ${calculators.length} calculators`);
