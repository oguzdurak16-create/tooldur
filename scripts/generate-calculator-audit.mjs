import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const calcDir = path.join(root, 'src', 'components', 'calculators');
const loaderPath = path.join(root, 'src', 'components', 'CalculatorClientLoader.tsx');
const toolsPath = path.join(root, 'src', 'data', 'tools.ts');
const outPath = path.join(root, 'public', '__calculator_audit.json');

const files = fs.readdirSync(calcDir)
  .filter((name) => name.endsWith('.tsx'))
  .sort((a, b) => a.localeCompare(b));

const interesting = /Math\.|parseLocalizedNumber|formatSmartNumber|toFixed|ISO\s?\d*|EN\s?\d*|ASTM|AWS|Barlow|Reynolds|OEE|Takt|molar|emisyon|emission|formül|formula|STANDARD|SERISI|MALZEME|density|yogunluk|gerilme|akma|verim|efficien|factor|katsay|kapasite|capacity|tolerance|tolerans|pitch|hatve|diameter|çap|basınç|pressure|voltage|gerilim|current|akım/i;
const expressionLike = /(?:const|let)\s+[A-Za-z_$][\w$]*\s*=.*(?:\+|\-|\*|\/|Math\.|\?)/;

const calculators = files.map((file) => {
  const fullPath = path.join(calcDir, file);
  const source = fs.readFileSync(fullPath, 'utf8');
  const lines = source.split(/\r?\n/);
  const excerpts = lines
    .map((text, index) => ({ line: index + 1, text }))
    .filter(({ text }) => interesting.test(text) || expressionLike.test(text))
    .slice(0, 300);
  return {
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
    source,
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  calculatorCount: calculators.length,
  loaderSource: fs.readFileSync(loaderPath, 'utf8'),
  toolsSource: fs.readFileSync(toolsPath, 'utf8'),
  calculators,
};

fs.writeFileSync(outPath, JSON.stringify(report));
console.log(`[calculator-audit] wrote ${calculators.length} calculators to ${outPath}`);
