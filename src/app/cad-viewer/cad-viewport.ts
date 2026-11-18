import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { CadModel, Coordinates } from './cad-model';

export type Direction = 'default' | 'top' | 'front' | 'side';

type Options = {
  model: CadModel;
  onPoint: (point: Coordinates) => void;
  isMeasuring: () => boolean;
};

export function createCadViewport(container: HTMLElement, { model, onPoint, isMeasuring }: Options) {
  const arrays = model.kind === 'step' ? model.meshes.map(mesh => mesh.position) : [model.segments];
  const bounds = new THREE.Box3();
  const vector = new THREE.Vector3();
  for (const positions of arrays) {
    for (let i = 0; i + 2 < positions.length; i += 3) {
      bounds.expandByPoint(vector.set(positions[i], positions[i + 1], positions[i + 2]));
    }
  }
  const center = bounds.getCenter(new THREE.Vector3());
  const extents = bounds.getSize(new THREE.Vector3());
  if (bounds.isEmpty() || ![...center, ...extents].every(Number.isFinite)) throw new Error('Model sınırları okunamadı.');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#111d2c');
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.setAttribute('aria-label', 'CAD çizimi');
  container.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = model.kind === 'step';
  controls.mouseButtons.LEFT = model.kind === 'dwg' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
  controls.touches.ONE = model.kind === 'dwg' ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

  function centered(positions: Float64Array) {
    const output = new Float32Array(positions.length);
    for (let i = 0; i + 2 < positions.length; i += 3) {
      output[i] = positions[i] - center.x;
      output[i + 1] = positions[i + 1] - center.y;
      output[i + 2] = positions[i + 2] - center.z;
    }
    return new THREE.BufferAttribute(output, 3);
  }

  const objects: (THREE.Mesh | THREE.LineSegments)[] = [];
  if (model.kind === 'step') {
    scene.add(new THREE.HemisphereLight('#f4f8ff', '#535b72', 2.15));
    const light = new THREE.DirectionalLight('#fff9ec', 2.1);
    light.position.set(1, -2, 4);
    scene.add(light);
    for (const mesh of model.meshes) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', centered(mesh.position));
      geometry.setIndex(new THREE.BufferAttribute(mesh.index, 1));
      if (mesh.normal?.length === mesh.position.length) {
        geometry.setAttribute('normal', new THREE.BufferAttribute(mesh.normal, 3));
      } else {
        geometry.computeVertexNormals();
      }
      const color = mesh.color ? new THREE.Color(...mesh.color) : new THREE.Color('#8eb8e2');
      objects.push(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.74, side: THREE.DoubleSide })));
    }
  } else {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', centered(model.segments));
    objects.push(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xd9eaff })));
  }
  for (const object of objects) scene.add(object);

  const markerGeometry = new THREE.BufferGeometry();
  const markerMaterial = new THREE.PointsMaterial({ color: 0xffbe55, size: 9, sizeAttenuation: false, depthTest: false });
  const markers = new THREE.Points(markerGeometry, markerMaterial);
  const calloutGeometry = new THREE.BufferGeometry();
  const calloutMaterial = new THREE.LineBasicMaterial({ color: 0xffbe55, depthTest: false });
  const callout = new THREE.Line(calloutGeometry, calloutMaterial);
  markers.renderOrder = callout.renderOrder = 10;
  markers.frustumCulled = callout.frustumCulled = false;
  scene.add(markers, callout);

  const span = Math.max(extents.length(), 0.001);
  const raycaster = new THREE.Raycaster();
  let halfHeight = span;
  let width = 1;
  let height = 1;

  function draw() {
    renderer.render(scene, camera);
  }

  function resize() {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    const ratio = width / height;
    renderer.setSize(width, height);
    camera.left = -halfHeight * ratio;
    camera.right = halfHeight * ratio;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    draw();
  }

  function fit(direction: Direction = 'default') {
    const top = model.kind === 'dwg' || direction === 'top';
    const isometric = new THREE.Vector3(1, -1.35, 1.1);
    const view = top ? new THREE.Vector3(0, 0, 1)
      : direction === 'front' ? new THREE.Vector3(0, -1, 0.0001)
      : direction === 'side' ? new THREE.Vector3(1, 0, 0) : isometric;
    controls.target.set(0, 0, 0);
    camera.position.copy(view.normalize().multiplyScalar(span * 2.5));
    camera.near = Math.max(span * 1e-4, 1e-7);
    camera.far = span * 12;
    camera.zoom = 1;
    halfHeight = span * 0.59 / Math.min(1, width / height);
    controls.update();
    resize();
  }

  function mark(points: Coordinates[]) {
    markerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
    calloutGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points.length === 2 ? points.flat() : [], 3));
    draw();
  }

  function candidateDistance(point: THREE.Vector3, ndc: THREE.Vector2) {
    const projected = point.clone().project(camera);
    return Math.hypot((projected.x - ndc.x) * width / 2, (projected.y - ndc.y) * height / 2);
  }

  function pick(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    const snapPixels = event.pointerType === 'touch' ? 16 : 10;
    raycaster.params.Line = { threshold: snapPixels * (halfHeight * 2 / camera.zoom / height) };
    raycaster.setFromCamera(ndc, camera);

    const hits = raycaster.intersectObjects(objects, false);
    const hit = model.kind === 'dwg' ? hits.reduce<typeof hits[number] | undefined>((best, candidate) =>
      !best || candidateDistance(candidate.point, ndc) < candidateDistance(best.point, ndc) ? candidate : best, undefined
    ) : hits[0];
    if (!hit || !(hit.object instanceof THREE.Mesh || hit.object instanceof THREE.LineSegments)) return;

    const position = hit.object.geometry.getAttribute('position');
    const candidates = model.kind === 'dwg' && hit.index !== undefined ? [hit.index, hit.index + 1]
      : hit.face ? [hit.face.a, hit.face.b, hit.face.c] : [];
    let bestDistance = snapPixels;
    let selected = hit.point;
    for (const index of candidates) {
      if (index >= position.count) continue;
      const candidate = new THREE.Vector3().fromBufferAttribute(position, index);
      const distance = candidateDistance(candidate, ndc);
      if (distance <= bestDistance) {
        selected = candidate;
        bestDistance = distance;
      }
    }
    onPoint([selected.x, selected.y, selected.z]);
  }

  let pressed: { x: number; y: number; id: number } | null = null;
  function pointerDown(event: PointerEvent) {
    if (event.isPrimary && event.button === 0) pressed = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }
  function pointerUp(event: PointerEvent) {
    if (!pressed || event.pointerId !== pressed.id) return;
    const distance = Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y);
    pressed = null;
    if (distance <= 6 && isMeasuring()) pick(event);
  }
  function cancelPointer() {
    pressed = null;
  }

  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', cancelPointer);
  controls.addEventListener('change', draw);
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  fit();

  return {
    extents: extents.toArray() as Coordinates,
    fit,
    mark,
    dispose() {
      observer.disconnect();
      controls.dispose();
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', cancelPointer);
      for (const object of objects) {
        object.geometry.dispose();
        const material = object.material as THREE.Material;
        material.dispose();
      }
      markerGeometry.dispose();
      markerMaterial.dispose();
      calloutGeometry.dispose();
      calloutMaterial.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
