/* global importScripts, occtimportjs */
importScripts('/cad-engine/step/occt-import-js.js');

self.onmessage = async ({ data }) => {
  try {
    const occt = await occtimportjs({ locateFile: file => '/cad-engine/step/' + file });
    const result = occt.ReadStepFile(new Uint8Array(data), {
      linearUnit: 'millimeter',
      linearDeflectionType: 'absolute_value',
      linearDeflection: 0.03,
      angularDeflection: 0.15,
    });
    if (!result.success || !result.meshes.length) throw new Error('STEP dosyasında görüntülenebilir katı veya yüzey bulunamadı.');

    let triangles = 0;
    const meshes = result.meshes.filter(mesh => mesh.index?.array?.length).map(mesh => {
      triangles += mesh.index.array.length / 3;
      if (triangles > 2_000_000) throw new Error('Bu model tarayıcıda görüntülemek için fazla büyük.');
      return {
        position: new Float64Array(mesh.attributes.position.array),
        index: new Uint32Array(mesh.index.array),
        normal: mesh.attributes.normal ? new Float32Array(mesh.attributes.normal.array) : undefined,
        color: mesh.color,
      };
    });
    if (!meshes.length) throw new Error('STEP dosyasında görüntülenebilir yüzey bulunamadı.');

    self.postMessage({ kind: 'step', meshes }, meshes.flatMap(mesh =>
      mesh.normal ? [mesh.position.buffer, mesh.index.buffer, mesh.normal.buffer] : [mesh.position.buffer, mesh.index.buffer]
    ));
  } catch (error) {
    self.postMessage({ error: error.message || 'STEP dosyası açılamadı.' });
  }
};
