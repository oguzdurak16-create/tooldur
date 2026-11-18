import { copyFile, mkdir, writeFile } from 'node:fs/promises';

const copyGroups = [
  ['node_modules/@mlightcad/libredwg-web/dist', 'dwg/dist', ['libredwg-web.js']],
  ['node_modules/@mlightcad/libredwg-web/wasm', 'dwg/wasm', ['libredwg-web.js', 'libredwg-web.wasm']],
  ['node_modules/occt-import-js/dist', 'step', ['occt-import-js.js', 'occt-import-js.wasm', 'license.occt-import-js.txt', 'license.occt.txt']],
  ['node_modules/three', '', ['LICENSE']],
];

for (const [source, destination, files] of copyGroups) {
  const target = new URL(`../public/cad-engine/${destination ? destination + '/' : ''}`, import.meta.url);
  await mkdir(target, { recursive: true });
  for (const file of files) {
    await copyFile(new URL(`../${source}/${file}`, import.meta.url), new URL(file, target));
  }
}

await writeFile(new URL('../public/cad-engine/NOTICE.txt', import.meta.url), [
  'Tooldur CAD Viewer dependencies',
  'LibreDWG-Web 0.9.0 (GPL-3.0): https://github.com/mlightcad/libredwg-web/tree/v0.9.0',
  'LibreDWG source: https://github.com/LibreDWG/libredwg',
  'GPL license: /cad-viewer/GPL-3.0.txt',
  'DWG worker source: /cad-viewer/dwg.worker.js',
  'Vercel asset preparation source: https://github.com/oguzdurak16-create/tooldur/blob/main/scripts/prepare-cad-engine.mjs',
  'occt-import-js 0.0.23: https://github.com/kovacsv/occt-import-js/tree/0.0.23',
  'Open CASCADE source: https://github.com/Open-Cascade-SAS/OCCT',
  'Open CASCADE licenses: ./step/license.occt-import-js.txt and ./step/license.occt.txt',
  'Three.js 0.183.2 license: ./LICENSE',
].join('\n') + '\n');
