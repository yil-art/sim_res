import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import { STLLoader } from './STLLoader.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
camera.position.set(1.2, 1.2, 1.2);
camera.up.set(0, 0, 1);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0.3);

scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const key = new THREE.DirectionalLight(0xffffff, 0.55);
key.position.set(2, 3, 4);
scene.add(key);

const meshes = [];                 // arm THREE.Mesh in geom order
const clickLayers = [];            // {name, obj, poses} clickable point layers (emission order = pick priority)
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function applyPose(pose) {
  for (let g = 0; g < meshes.length; g++) {
    const p = pose[g];
    meshes[g].position.set(p[0], p[1], p[2]);
    meshes[g].quaternion.set(p[4], p[5], p[6], p[3]);   // three uses (x,y,z,w)
  }
}

function pick(ev) {
  const r = canvas.getBoundingClientRect();
  pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  for (const L of clickLayers) {              // priority order: reach_normal precedes reach_xyz
    if (!L.obj.visible) continue;
    let bi = null, bd = Infinity;
    for (const h of raycaster.intersectObject(L.obj, false)) {
      if (h.index != null && L.poses[h.index] != null && h.distanceToRay < bd) { bd = h.distanceToRay; bi = h.index; }
    }
    if (bi != null) {
      applyPose(L.poses[bi]);
      document.getElementById('info').textContent = `${L.name} · point ${bi}`;
      return;
    }
  }
}

let downXY = null;
canvas.addEventListener('pointerdown', (e) => { downXY = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', (e) => {
  if (!downXY) return;
  const moved = Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]);
  downXY = null;
  if (moved < 5) pick(e);
});

function animate() {
  requestAnimationFrame(animate);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  controls.update();
  renderer.render(scene, camera);
}

function hexInt(c) { return (c[0] << 16) | (c[1] << 8) | c[2]; }

function addCheckbox(panel, name, color, count, visible, onToggle) {
  const row = document.createElement('label');
  const cnt = count != null ? ` (${count})` : '';
  row.innerHTML =
    `<input type="checkbox" ${visible ? 'checked' : ''}>` +
    `<span style="color:rgb(${color[0]},${color[1]},${color[2]})"> ■ </span>${name}${cnt}`;
  row.querySelector('input').addEventListener('change', (e) => onToggle(e.target.checked));
  panel.appendChild(row);
}

function buildPoints(L, pointSize) {
  const N = L.points.length;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i*3]=L.points[i][0]; pos[i*3+1]=L.points[i][1]; pos[i*3+2]=L.points[i][2]; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const opts = { size: pointSize, sizeAttenuation: true };
  if (L.colors) {
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { col[i*3]=L.colors[i][0]/255; col[i*3+1]=L.colors[i][1]/255; col[i*3+2]=L.colors[i][2]/255; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    opts.vertexColors = true;
  } else {
    opts.color = hexInt(L.color);
  }
  const obj = new THREE.Points(g, new THREE.PointsMaterial(opts));
  obj.visible = L.visible;
  return { obj, N };
}

function buildLines(L) {
  const E = L.segments.length;
  const pos = new Float32Array(E * 6);
  for (let i = 0; i < E; i++) {
    const s = L.segments[i];
    pos[i*6]=s[0][0]; pos[i*6+1]=s[0][1]; pos[i*6+2]=s[0][2];
    pos[i*6+3]=s[1][0]; pos[i*6+4]=s[1][1]; pos[i*6+5]=s[1][2];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const obj = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: hexInt(L.color) }));
  obj.visible = L.visible;
  return obj;
}

function buildMesh(L) {
  const pos = new Float32Array(L.vertices.length * 3);
  for (let i = 0; i < L.vertices.length; i++) { pos[i*3]=L.vertices[i][0]; pos[i*3+1]=L.vertices[i][1]; pos[i*3+2]=L.vertices[i][2]; }
  const idx = new Uint32Array(L.faces.length * 3);
  for (let i = 0; i < L.faces.length; i++) { idx[i*3]=L.faces[i][0]; idx[i*3+1]=L.faces[i][1]; idx[i*3+2]=L.faces[i][2]; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  const obj = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
    color: hexInt(L.color), transparent: true, opacity: L.opacity ?? 0.3,
    side: THREE.DoubleSide, metalness: 0.0, roughness: 1.0 }));
  obj.visible = L.visible;
  return obj;
}

async function main() {
  const scn = await (await fetch('./scene.json')).json();
  document.title = scn.title;
  document.getElementById('title').textContent = scn.title;
  scene.background = new THREE.Color(scn.background || '#ffffff');
  if (scn.summary) {
    const btn = document.getElementById('summary-toggle');
    const pre = document.getElementById('summary');
    pre.textContent = scn.summary;
    pre.style.display = 'none';
    btn.style.display = 'inline-block';
    btn.addEventListener('click', () => {
      pre.style.display = pre.style.display === 'none' ? 'block' : 'none';
    });
  }
  const cam = scn.camera;                                  // baked initial view (editable in scene.json)
  if (cam) {
    if (cam.fov) camera.fov = cam.fov;
    if (cam.position) camera.position.set(cam.position[0], cam.position[1], cam.position[2]);
    if (cam.up) camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
    if (cam.target) controls.target.set(cam.target[0], cam.target[1], cam.target[2]);
    camera.updateProjectionMatrix();
  }
  const grid = new THREE.GridHelper(2, 20, 0xcccccc, 0xe6e6e6);
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);
  raycaster.params.Points.threshold = scn.point_size;

  const loader = new STLLoader();
  for (const m of scn.meshes) {
    const buf = await (await fetch(m.file)).arrayBuffer();
    const geo = loader.parse(buf);
    geo.scale(m.scale[0], m.scale[1], m.scale[2]);
    const mesh = new THREE.Mesh(
      geo, new THREE.MeshStandardMaterial({ color: hexInt(m.color), metalness: 0.1, roughness: 0.85 }));
    const hh = m.home;
    mesh.position.set(hh[0], hh[1], hh[2]);
    mesh.quaternion.set(hh[4], hh[5], hh[6], hh[3]);
    scene.add(mesh); meshes.push(mesh);
  }

  const panel = document.getElementById('panel');
  for (const L of scn.layers) {
    if (L.kind === 'lines') {
      const obj = buildLines(L); scene.add(obj);
      addCheckbox(panel, L.name, L.color, null, L.visible, (v) => { obj.visible = v; });
    } else if (L.kind === 'mesh') {
      const obj = buildMesh(L); scene.add(obj);
      addCheckbox(panel, L.name, L.color, null, L.visible, (v) => { obj.visible = v; });
    } else {                                   // 'points'
      const { obj, N } = buildPoints(L, scn.point_size); scene.add(obj);
      if (L.clickable) clickLayers.push({ name: L.name, obj, poses: L.poses });
      const swatch = L.color || (L.colors && L.colors.length ? L.colors[0] : [180, 180, 180]);
      addCheckbox(panel, L.name, swatch, N, L.visible, (v) => { obj.visible = v; });
    }
  }
  animate();
}

main();
