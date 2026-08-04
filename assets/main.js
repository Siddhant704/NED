/* ==========================================================================
   NEDLLOYD LOGISTICS — SHARED SITE BEHAVIOR + 3D MODULES
   ========================================================================== */

/* ---------------- MODALS ---------------- */
function openModal(id){ const m = document.getElementById(id); if(m) m.classList.add('show'); }
function closeModal(id){ const m = document.getElementById(id); if(m) m.classList.remove('show'); }
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.modal-overlay').forEach(m=>{
    m.addEventListener('click', e=>{ if(e.target===m) m.classList.remove('show'); });
  });
  document.querySelectorAll('.role-chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chip.parentElement.querySelectorAll('.role-chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
});

/* ---------------- MOBILE NAV ---------------- */
function toggleMobile(){
  const m = document.getElementById('mobileMenu');
  if(!m) return;
  m.style.display = (m.style.display==='none' || !m.style.display) ? 'block' : 'none';
}

/* ---------------- ROLE TABS (tracking page) ---------------- */
function showRoleTab(name, btn){
  document.querySelectorAll('.role-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.role-tab').forEach(t=>t.classList.remove('active'));
  const panel = document.getElementById('panel-'+name);
  if(panel) panel.classList.add('active');
  if(btn) btn.classList.add('active');
}

/* ---------------- TILT EFFECT ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - 0.5;
      const y = (e.clientY - r.top)/r.height - 0.5;
      card.style.transform = `rotateY(${x*8}deg) rotateX(${-y*8}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform = 'rotateY(0) rotateX(0)'; });
  });
});

/* ---------------- QUOTE / ENQUIRY FORM ---------------- */
function handleQuote(e){
  e.preventDefault();
  const toast = document.getElementById('quoteToast');
  if(toast) toast.classList.add('show');
  e.target.reset();
  toggleCharterFields();
}

function toggleCharterFields(){
  const select = document.getElementById('qService');
  const fields = document.getElementById('charterFields');
  if(!select || !fields) return;
  fields.style.display = select.value === 'charter' ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const select = document.getElementById('qService');
  if(!select) return;
  if(new URLSearchParams(window.location.search).get('service') === 'charter'){
    select.value = 'charter';
  }
  toggleCharterFields();
});

/* ---------------- STAT COUNTERS (data-target driven, reusable anywhere) ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  const stats = document.querySelectorAll('.stat b[data-target]');
  if(!stats.length) return;
  const seen = new WeakSet();
  function animate(el){
    if(seen.has(el)) return;
    seen.add(el);
    const end = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const dur = 1200; const t0 = performance.now();
    function tick(now){
      const p = Math.min((now-t0)/dur,1);
      const val = Math.floor(p*end);
      el.textContent = val.toLocaleString() + (p===1? suffix : '');
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting) animate(en.target); });
  },{threshold:0.4});
  stats.forEach(s=>io.observe(s));
});

/* ---------------- SHARED GLOW TEXTURE ---------------- */
function makeGlowTexture(){
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  g.addColorStop(0,'rgba(255,255,255,1)');
  g.addColorStop(0.28,'rgba(255,215,170,0.95)');
  g.addColorStop(0.6,'rgba(255,138,71,0.45)');
  g.addColorStop(1,'rgba(255,106,26,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* ---------------- REUSABLE 3D ORBIT-GLOBE SCENE ----------------
   Works for both the full home hero and the smaller inner-page heroes.
   opts: { full:boolean } — full=true adds ambient dust + slightly bigger scale
------------------------------------------------------------------ */
function initOrbitGlobe(canvasId, opts){
  opts = opts || {};
  const canvas = document.getElementById(canvasId);
  if(!canvas || typeof THREE === 'undefined') return;
  const wrap = canvas.parentElement;
  let W = wrap.clientWidth, H = wrap.clientHeight;
  if(!W || !H) return;

  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 100);
  camera.position.set(0,0,9);

  const group = new THREE.Group();
  scene.add(group);

  const glowTex = makeGlowTexture();
  const scale = (opts.full ? 1 : 0.8) * (opts.scale || 1);

  const globeGeo = new THREE.IcosahedronGeometry(2.6*scale, 3);
  const globeMat = new THREE.MeshBasicMaterial({color:0xFF6A1A, wireframe:true, transparent:true, opacity:0.30});
  const globe = new THREE.Mesh(globeGeo, globeMat);
  group.add(globe);

  const innerGeo = new THREE.SphereGeometry(2.45*scale, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({color:0x181E4D, transparent:true, opacity:0.6});
  const inner = new THREE.Mesh(innerGeo, innerMat);
  group.add(inner);

  const ringGeo1 = new THREE.TorusGeometry(3.3*scale, 0.012, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({color:0xFF8A47, transparent:true, opacity:0.55});
  const ring1 = new THREE.Mesh(ringGeo1, ringMat);
  ring1.rotation.x = Math.PI/2.4;
  group.add(ring1);
  const ring2 = new THREE.Mesh(ringGeo1.clone(), ringMat.clone());
  ring2.rotation.x = Math.PI/1.6;
  ring2.rotation.y = Math.PI/3;
  group.add(ring2);

  const nodes = [];
  const nodeScales = [0.55, 0.42, 0.68].map(v=>v*scale);
  for(let i=0;i<3;i++){
    const mat = new THREE.SpriteMaterial({map:glowTex, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false});
    const node = new THREE.Sprite(mat);
    node.scale.set(nodeScales[i], nodeScales[i], 1);
    node.userData = { angle:(i/3)*Math.PI*2, radius:3.3*scale, speed:0.004 + i*0.0012, ring:i%2===0?ring1:ring2 };
    group.add(node);
    nodes.push(node);

    const trailMat = new THREE.SpriteMaterial({map:glowTex, transparent:true, opacity:0.28, blending:THREE.AdditiveBlending, depthWrite:false});
    const trail = new THREE.Sprite(trailMat);
    trail.scale.set(nodeScales[i]*0.65, nodeScales[i]*0.65, 1);
    trail.userData = { angle:node.userData.angle - 0.18, radius:3.3*scale, speed:node.userData.speed, ring:node.userData.ring };
    group.add(trail);
    nodes.push(trail);
  }

  let stars = null;
  if(opts.full){
    const starGeo = new THREE.BufferGeometry();
    const starCount = 160;
    const positions = new Float32Array(starCount*3);
    for(let i=0;i<starCount;i++){
      positions[i*3] = (Math.random()-0.5)*14;
      positions[i*3+1] = (Math.random()-0.5)*14;
      positions[i*3+2] = (Math.random()-0.5)*8 - 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    const starMat = new THREE.PointsMaterial({color:0xFFD9B8, size:0.028, transparent:true, opacity:0.35, map:glowTex, depthWrite:false, blending:THREE.AdditiveBlending});
    stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
  }

  group.position.set(opts.full ? 2.1 : 0.6, 0, 0);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e=>{
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  function animate(){
    requestAnimationFrame(animate);
    globe.rotation.y += 0.0016;
    inner.rotation.y -= 0.001;
    ring1.rotation.z += 0.0012;
    ring2.rotation.z -= 0.0009;
    nodes.forEach(n=>{
      n.userData.angle += n.userData.speed;
      const a = n.userData.angle;
      const r = n.userData.radius;
      const ringRotX = n.userData.ring.rotation.x;
      n.position.set(Math.cos(a)*r, Math.sin(a)*r*Math.sin(ringRotX), Math.sin(a)*r*Math.cos(ringRotX));
    });
    group.rotation.y += (mouseX*0.3 - group.rotation.y)*0.03;
    group.rotation.x += (mouseY*0.2 - group.rotation.x)*0.03;
    if(stars) stars.rotation.y += 0.0002;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', ()=>{
    W = wrap.clientWidth; H = wrap.clientHeight;
    if(!W || !H) return;
    renderer.setSize(W,H);
    camera.aspect = W/H;
    camera.updateProjectionMatrix();
  });
}

/* ---------------- SHARED 3D SCENE BOOTSTRAP ---------------- */
function create3DBase(canvasId, fov){
  const canvas = document.getElementById(canvasId);
  if(!canvas || typeof THREE === 'undefined') return null;
  const wrap = canvas.parentElement;
  let W = wrap.clientWidth, H = wrap.clientHeight;
  if(!W || !H) return null;
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov || 45, W/H, 0.1, 100);
  camera.position.set(0,0,9);
  window.addEventListener('resize', ()=>{
    W = wrap.clientWidth; H = wrap.clientHeight;
    if(!W || !H) return;
    renderer.setSize(W,H);
    camera.aspect = W/H;
    camera.updateProjectionMatrix();
  });
  return {renderer, scene, camera, wrap};
}

/* ---------------- SCENE: PARTICLE FLOW (About / Corporate / Privacy / Terms) ---------------- */
function initParticleFlow(canvasId, opts){
  opts = opts || {};
  const base = create3DBase(canvasId, 50);
  if(!base) return;
  const {renderer, scene, camera} = base;
  const glowTex = makeGlowTexture();
  const cols = opts.light ? 7 : 9, rows = opts.light ? 5 : 6;
  const count = cols*rows;
  const geo = new THREE.BufferGeometry();
  const base_pos = new Float32Array(count*3);
  const positions = new Float32Array(count*3);
  let idx = 0;
  for(let x=0;x<cols;x++){
    for(let z=0;z<rows;z++){
      const px = (x/(cols-1) - 0.5) * 7 + 1.4;
      const pz = (z/(rows-1) - 0.5) * 5;
      base_pos[idx*3] = px; base_pos[idx*3+1] = 0; base_pos[idx*3+2] = pz;
      positions[idx*3] = px; positions[idx*3+1] = 0; positions[idx*3+2] = pz;
      idx++;
    }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({
    map:glowTex, color:0xFF8A47, size: opts.light ? 0.34 : 0.42, transparent:true, opacity: opts.light ? 0.32 : 0.5,
    depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true
  });
  const points = new THREE.Points(geo, mat);
  points.rotation.x = -0.5;
  scene.add(points);
  camera.position.set(0,3.4,7.5);
  camera.lookAt(1.4,0,0);

  let t = 0;
  function animate(){
    requestAnimationFrame(animate);
    t += 0.012;
    const pos = geo.attributes.position.array;
    for(let i=0;i<count;i++){
      const bx = base_pos[i*3], bz = base_pos[i*3+2];
      pos[i*3+1] = Math.sin(bx*0.7 + t) * 0.5 + Math.cos(bz*0.6 + t*0.8) * 0.4;
    }
    geo.attributes.position.needsUpdate = true;
    points.rotation.y += 0.0009;
    renderer.render(scene, camera);
  }
  animate();
}

/* ---------------- SCENE: CRATE GRID (Services / Careers) ---------------- */
function initCrateGrid(canvasId, opts){
  opts = opts || {};
  const base = create3DBase(canvasId, 45);
  if(!base) return;
  const {renderer, scene, camera} = base;
  camera.position.set(0,0,10);
  const glowTex = makeGlowTexture();

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex, color:0xFF8A47, transparent:true, opacity:0.35, blending:THREE.AdditiveBlending, depthWrite:false}));
  glow.scale.set(6,6,1);
  glow.position.set(1.6,0,-1);
  scene.add(glow);

  const crates = [];
  const n = 7;
  for(let i=0;i<n;i++){
    const size = 0.7 + Math.random()*0.5;
    const geo = new THREE.BoxGeometry(size,size,size);
    const edges = new THREE.EdgesGeometry(geo);
    const mat = new THREE.LineBasicMaterial({color: i%3===0 ? 0xFFFFFF : 0xFF8A47, transparent:true, opacity:0.6});
    const crate = new THREE.LineSegments(edges, mat);
    crate.position.set(
      1.6 + (Math.random()-0.5)*4.6,
      (Math.random()-0.5)*3.4,
      (Math.random()-0.5)*3.2
    );
    crate.userData = { phase: Math.random()*Math.PI*2, speed: 0.3+Math.random()*0.4, baseY: crate.position.y, rSpeed:(Math.random()-0.5)*0.01 };
    scene.add(crate);
    crates.push(crate);
  }

  let mouseX=0, mouseY=0;
  window.addEventListener('mousemove', e=>{
    mouseX = (e.clientX/window.innerWidth)-0.5;
    mouseY = (e.clientY/window.innerHeight)-0.5;
  });

  let t = 0;
  function animate(){
    requestAnimationFrame(animate);
    t += 0.016;
    crates.forEach(c=>{
      c.rotation.x += c.userData.rSpeed;
      c.rotation.y += c.userData.rSpeed*1.3;
      c.position.y = c.userData.baseY + Math.sin(t*c.userData.speed + c.userData.phase)*0.35;
    });
    scene.rotation.y += (mouseX*0.15 - scene.rotation.y)*0.02;
    scene.rotation.x += (mouseY*0.1 - scene.rotation.x)*0.02;
    renderer.render(scene, camera);
  }
  animate();
}

/* ---------------- SCENE: CONSTELLATION NETWORK (Industries / Careers) ---------------- */
function initConstellation(canvasId, opts){
  opts = opts || {};
  const base = create3DBase(canvasId, 48);
  if(!base) return;
  const {renderer, scene, camera} = base;
  camera.position.set(0,0,9);
  const glowTex = makeGlowTexture();
  const group = new THREE.Group();
  scene.add(group);
  group.position.set(1.6,0,0);

  const nodeCount = 15;
  const nodePositions = [];
  for(let i=0;i<nodeCount;i++){
    nodePositions.push(new THREE.Vector3(
      (Math.random()-0.5)*6.5,
      (Math.random()-0.5)*4.4,
      (Math.random()-0.5)*3.5
    ));
  }
  nodePositions.forEach((p,i)=>{
    const s = 0.28 + Math.random()*0.3;
    const mat = new THREE.SpriteMaterial({map:glowTex, transparent:true, opacity:0.85, blending:THREE.AdditiveBlending, depthWrite:false});
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(s,s,1);
    sprite.position.copy(p);
    group.add(sprite);
  });

  const linePositions = [];
  const threshold = 3.1;
  for(let i=0;i<nodePositions.length;i++){
    for(let j=i+1;j<nodePositions.length;j++){
      if(nodePositions[i].distanceTo(nodePositions[j]) < threshold){
        linePositions.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
        linePositions.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions),3));
  const lineMat = new THREE.LineBasicMaterial({color:0xFF8A47, transparent:true, opacity:0.28});
  group.add(new THREE.LineSegments(lineGeo, lineMat));

  let mouseX=0;
  window.addEventListener('mousemove', e=>{ mouseX = (e.clientX/window.innerWidth)-0.5; });

  function animate(){
    requestAnimationFrame(animate);
    group.rotation.y += 0.0022;
    group.rotation.y += (mouseX*0.3 - 0)*0.0006;
    renderer.render(scene, camera);
  }
  animate();
}

/* ---------------- SCENE: RING STACK (Tracking / Compliances) ---------------- */
function initRingStack(canvasId, opts){
  opts = opts || {};
  const base = create3DBase(canvasId, 45);
  if(!base) return;
  const {renderer, scene, camera} = base;
  camera.position.set(0,0,9);
  const glowTex = makeGlowTexture();
  const group = new THREE.Group();
  scene.add(group);
  group.position.set(1.6,0,0);

  const core = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false}));
  core.scale.set(0.6,0.6,1);
  group.add(core);

  const ringCount = opts.simple ? 3 : 4;
  const rings = [];
  for(let i=0;i<ringCount;i++){
    const radius = 1.1 + i*0.62;
    const geo = new THREE.TorusGeometry(radius, 0.012, 8, 100);
    const mat = new THREE.MeshBasicMaterial({color: i%2===0 ? 0xFF6A1A : 0xFF8A47, transparent:true, opacity:0.55 - i*0.06});
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI/2.4 + i*0.35;
    ring.rotation.y = i*0.5;
    ring.userData = { spin: (i%2===0?1:-1) * (0.001 + i*0.0004) };
    group.add(ring);
    rings.push(ring);
  }

  let mouseX=0, mouseY=0;
  window.addEventListener('mousemove', e=>{
    mouseX = (e.clientX/window.innerWidth)-0.5;
    mouseY = (e.clientY/window.innerHeight)-0.5;
  });

  function animate(){
    requestAnimationFrame(animate);
    rings.forEach(r=>{ r.rotation.z += r.userData.spin; });
    group.rotation.y += (mouseX*0.25 - group.rotation.y)*0.02;
    group.rotation.x += (mouseY*0.15 - group.rotation.x)*0.02;
    renderer.render(scene, camera);
  }
  animate();
}

/* ---------------- SCENE: RADAR PING (Contact) ---------------- */
function initRadarPing(canvasId, opts){
  opts = opts || {};
  const base = create3DBase(canvasId, 45);
  if(!base) return;
  const {renderer, scene, camera} = base;
  camera.position.set(0,0,8);
  const glowTex = makeGlowTexture();
  const group = new THREE.Group();
  scene.add(group);
  group.position.set(1.6,0,0);

  const core = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex, transparent:true, opacity:0.95, blending:THREE.AdditiveBlending, depthWrite:false}));
  core.scale.set(0.55,0.55,1);
  group.add(core);

  const ringCount = 3;
  const pings = [];
  for(let i=0;i<ringCount;i++){
    const geo = new THREE.RingGeometry(0.9, 1.0, 48);
    const mat = new THREE.MeshBasicMaterial({color:0xFF6A1A, transparent:true, opacity:0.6, side:THREE.DoubleSide});
    const ring = new THREE.Mesh(geo, mat);
    ring.userData = { phase: (i/ringCount) };
    group.add(ring);
    pings.push(ring);
  }

  const sweepGeo = new THREE.CircleGeometry(2.6, 24, 0, Math.PI/4);
  const sweepMat = new THREE.MeshBasicMaterial({color:0xFF8A47, transparent:true, opacity:0.12, side:THREE.DoubleSide});
  const sweep = new THREE.Mesh(sweepGeo, sweepMat);
  group.add(sweep);

  let t = 0;
  function animate(){
    requestAnimationFrame(animate);
    t += 0.006;
    pings.forEach(r=>{
      const p = (t + r.userData.phase) % 1;
      const s = 0.4 + p*3.2;
      r.scale.set(s,s,1);
      r.material.opacity = 0.5 * (1-p);
    });
    sweep.rotation.z -= 0.006;
    renderer.render(scene, camera);
  }
  animate();
}

/* ---------------- SITEWIDE AMBIENT PARTICLE BACKGROUND ---------------- */
function initAmbientBackground(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas || typeof THREE === 'undefined') return;
  let W = window.innerWidth, H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.setSize(W,H);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W/H, 0.1, 100);
  camera.position.z = 12;

  const glowTex = makeGlowTexture();
  const count = 46;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count*3);
  const speeds = new Float32Array(count);
  for(let i=0;i<count;i++){
    positions[i*3] = (Math.random()-0.5)*24;
    positions[i*3+1] = (Math.random()-0.5)*16;
    positions[i*3+2] = (Math.random()-0.5)*10;
    speeds[i] = 0.15 + Math.random()*0.3;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({
    map:glowTex, color:0xFF8A47, size:0.5, transparent:true, opacity:0.4,
    depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let last = performance.now();
  function animate(now){
    requestAnimationFrame(animate);
    const dt = Math.min((now-last)/1000, 0.05);
    last = now;
    const pos = geo.attributes.position.array;
    for(let i=0;i<count;i++){
      pos[i*3+1] += speeds[i]*dt;
      if(pos[i*3+1] > 8){ pos[i*3+1] = -8; }
    }
    geo.attributes.position.needsUpdate = true;
    points.rotation.y += 0.0004;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  window.addEventListener('resize', ()=>{
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W,H);
    camera.aspect = W/H;
    camera.updateProjectionMatrix();
  });
}

/* ---------------- SCROLL REVEAL ("baseline" rise-up on scroll) ---------------- */
function initScrollReveal(){
  const targets = document.querySelectorAll('body > section:not(.stack-section):not(.cover-natural), body > footer');
  if(!targets.length) return;

  if(typeof IntersectionObserver === 'undefined'){
    targets.forEach(el=>el.classList.add('reveal','in-view'));
    return;
  }

  targets.forEach(el=>el.classList.add('reveal'));

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      // Force the browser to paint the hidden (pre-transition) state on its
      // own frame first — otherwise adding "in-view" right away can get
      // coalesced with the initial style and the transition never plays.
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          el.classList.add('in-view');
        });
      });
    });
  }, {threshold:0, rootMargin:'0px 0px -10% 0px'});

  targets.forEach(el=>io.observe(el));
}

/* ---------------- NAV SLIDING ACTIVE PILL ----------------
   Vanilla-JS equivalent of a Framer Motion shared-layoutId pill: a single
   absolutely-positioned span slides (via a bouncy cubic-bezier, standing
   in for spring physics) to whichever link is active or hovered. Since
   this is a real multi-page site (full navigation, not client-side
   routing), the pill can't FLIP-animate across a page load — it appears
   already in place for the current page, then slides smoothly on hover. */
function initNavPill(){
  const nav = document.querySelector('.nav-links');
  if(!nav) return;
  const links = Array.from(nav.querySelectorAll('a'));
  if(!links.length) return;

  links.forEach(a=>{
    a.innerHTML = `<span class="nav-label">${a.textContent}</span>`;
  });

  const pill = document.createElement('span');
  pill.className = 'nav-pill';
  pill.setAttribute('aria-hidden', 'true');
  nav.insertBefore(pill, nav.firstChild);

  function movePillTo(el){
    if(!el) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    pill.style.left = (elRect.left - navRect.left) + 'px';
    pill.style.width = elRect.width + 'px';
    pill.classList.add('ready');
    links.forEach(a=>a.classList.remove('pill-target'));
    el.classList.add('pill-target');
  }

  const activeLink = links.find(a=>a.classList.contains('active')) || links[0];

  // position instantly on load (no slide-in from the corner), then
  // re-enable the transition for subsequent hover moves
  pill.style.transition = 'none';
  movePillTo(activeLink);
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{ pill.style.transition = ''; });
  });

  links.forEach(a=>{
    a.addEventListener('mouseenter', ()=> movePillTo(a));
  });
  nav.addEventListener('mouseleave', ()=> movePillTo(activeLink));

  window.addEventListener('resize', ()=>{
    const current = nav.querySelector('.pill-target') || activeLink;
    pill.style.transition = 'none';
    movePillTo(current);
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{ pill.style.transition = ''; });
    });
  });
}

/* ---------------- FLOATING WIDGETS: WhatsApp + rule-based chat assistant ----------------
   No backend/API involved — the chat is a keyword-matched knowledge base
   built entirely from this site's own published content (services,
   industries, tracking, contact, careers, compliances). The WhatsApp
   number below is the site's listed office line, formatted for wa.me;
   swap in a dedicated WhatsApp business number if Nedlloyd has one. */
const WHATSAPP_NUMBER = '919667911539'; // +91 96679 11539

const CHAT_KB = [
  { keywords:['service','freight','transport','warehous','customs','courier','ecommerce','e-commerce','fulfillment','reverse logistics','4pl','brokerage'],
    reply:'We offer 9 services: Freight Transportation, Import &amp; Export, Customs Clearance &amp; Brokerage, Warehousing &amp; Distribution, Express Courier &amp; Cargo, E-Commerce Fulfillment, Reverse Logistics, 4th Party Logistics (4PL), and Project-Based Solutions. Full details on our <a href="services.html" target="_blank">Services page</a>.' },
  { keywords:['industr','sector','oil','gas','power','solar','wind','bess','battery','steel','cement','automotive','rail','telecom','epc','infrastructure'],
    reply:'We move cargo for Oil &amp; Gas, Power, BESS/Battery Storage, Solar, Wind, EPC &amp; Infrastructure, Steel &amp; Cement, Automotive, Rail and Telecom. See our <a href="industries.html" target="_blank">Industries page</a> for more.' },
  { keywords:['track','shipment','dashboard','job no','milestone','status','login','pod'],
    reply:'You can track any shipment through our Customer Dashboard using your Job, Container or Invoice number — covering all 10 milestones from booking to delivery. Visit the <a href="tracking.html" target="_blank">Tracking page</a> or click "Client Login" in the menu.' },
  { keywords:['contact','phone','email','address','office','reach','call','number'],
    reply:'Reach us at info@nedlloydgroup.com or +91-11-49866666 (also +91-11-49866600). Head office: T-95A, 4th Floor, C.L. House, Yusuf Sarai Commercial Centre, Gautam Nagar, New Delhi–110049. Hours: Mon–Sat, 9 AM–6 PM IST. Full details on our <a href="contact.html" target="_blank">Contact page</a>.' },
  { keywords:['career','job open','hiring','vacan','apply','join','resume'],
    reply:'We\'re always looking for smart, motivated people. Check current openings on our <a href="careers.html" target="_blank">Careers page</a> or email your resume to info@nedlloydgroup.com.' },
  { keywords:['complian','certif','iso','ohsas','wca','quality','safety','audit'],
    reply:'Nedlloyd operates under ISO 9001:2015, ISO 14001, OHSAS 18001 and WCA network certifications. Details on our <a href="compliances.html" target="_blank">Compliances page</a>.' },
  { keywords:['quote','price','cost','rate','estimate','enquiry'],
    reply:'For a quote, share your shipment details (origin, destination, cargo type, timeline) through our <a href="contact.html" target="_blank">enquiry form</a> and our team responds within one business day.' },
  { keywords:['privacy','data protection','gdpr'],
    reply:'You can read how we handle data on our <a href="privacy.html" target="_blank">Privacy Policy page</a>.' },
  { keywords:['terms','condition','legal'],
    reply:'Our website and dashboard terms are on the <a href="terms.html" target="_blank">Terms of Use page</a>.' },
  { keywords:['about','company','who are you','overview','history'],
    reply:'Nedlloyd Logistics is an integrated logistics organization serving Energy, Steel, Power, Oil &amp; Gas, Infrastructure, Automotive and Rail — 3,554+ projects completed, with 123 national and 27 international partners. More on our <a href="about.html" target="_blank">About page</a>.' },
  { keywords:['hour','timing','open now','what time'],
    reply:'Our office hours are Monday–Saturday, 9:00 AM–6:00 PM IST.' },
  { keywords:['corporate','client','partner with'],
    reply:'See who we\'ve partnered with and our company culture on the <a href="corporate.html" target="_blank">Corporate page</a>.' },
  { keywords:['hi','hello','hey','good morning','good afternoon'],
    reply:'Hello! How can I help — our services, industries we serve, shipment tracking, or contact details?' },
  { keywords:['thank'],
    reply:'You\'re welcome! Anything else I can help with?' },
  { keywords:['bye','goodbye'],
    reply:'Thanks for stopping by — reach out anytime at info@nedlloydgroup.com.' }
];

function chatBotReply(msg){
  const lower = msg.toLowerCase();
  for(const item of CHAT_KB){
    if(item.keywords.some(k=>lower.includes(k))) return item.reply;
  }
  return 'I\'m not totally sure about that one — for anything specific, email info@nedlloydgroup.com, call +91-11-49866666, or use the enquiry form on our <a href="contact.html" target="_blank">Contact page</a>.';
}

function initFloatingWidgets(){
  if(document.getElementById('fabStack')) return;

  const wrap = document.createElement('div');
  wrap.className = 'fab-stack';
  wrap.id = 'fabStack';
  wrap.innerHTML = `
    <a class="fab fab-whatsapp" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Nedlloyd, I have a question about your services.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.47 14.38c-.29-.15-1.71-.84-1.98-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.93 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.91-2.18-.24-.57-.48-.5-.66-.51h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.2 2.06 3.14 4.98 4.41.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.71-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.56-.34z"/><path d="M12.02 2C6.5 2 2.03 6.44 2.03 11.9c0 1.83.5 3.55 1.36 5.03L2 22l5.24-1.36a10.1 10.1 0 0 0 4.78 1.22h.01c5.52 0 10-4.44 10-9.9C22 6.44 17.53 2 12.02 2zm0 18.13h-.01a8.24 8.24 0 0 1-4.2-1.15l-.3-.18-3.11.8.83-2.99-.2-.31a8.03 8.03 0 0 1-1.25-4.4c0-4.46 3.66-8.09 8.16-8.09 4.35 0 8.06 3.63 8.06 8.09 0 4.46-3.71 8.23-8.18 8.23z"/></svg>
    </a>
    <button class="fab fab-chat" id="chatToggle" aria-label="Open chat assistant">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      <span class="fab-dot"></span>
    </button>
  `;
  document.body.appendChild(wrap);

  const win = document.createElement('div');
  win.className = 'chat-window';
  win.id = 'chatWindow';
  win.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-title">
        <span class="dot"></span>
        <div><b>Nedlloyd Assistant</b><span>Usually replies instantly</span></div>
      </div>
      <button class="chat-close" id="chatClose" aria-label="Close chat">&times;</button>
    </div>
    <div class="chat-body" id="chatBody"></div>
    <div class="chat-quick" id="chatQuick">
      <button data-q="What services do you offer?">Our Services</button>
      <button data-q="Which industries do you serve?">Industries</button>
      <button data-q="How do I track a shipment?">Track a Shipment</button>
      <button data-q="How can I contact you?">Contact Us</button>
      <button data-q="Are you hiring?">Careers</button>
    </div>
    <form class="chat-input-row" id="chatForm">
      <input type="text" id="chatInput" placeholder="Type your question..." autocomplete="off">
      <button type="submit" aria-label="Send">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  `;
  document.body.appendChild(win);

  const toggle = document.getElementById('chatToggle');
  const closeBtn = document.getElementById('chatClose');
  const body = document.getElementById('chatBody');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const quick = document.getElementById('chatQuick');
  let greeted = false;

  function addMsg(text, who){
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function openChat(){
    win.classList.add('open');
    if(!greeted){
      greeted = true;
      addMsg('Hi! I\'m the Nedlloyd Assistant. Ask me about our services, industries, tracking, careers, or how to get in touch — or pick a quick option below.', 'bot');
    }
    input.focus();
  }
  function closeChat(){ win.classList.remove('open'); }

  toggle.addEventListener('click', ()=>{
    if(win.classList.contains('open')) closeChat(); else openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const val = input.value.trim();
    if(!val) return;
    addMsg(val.replace(/</g,'&lt;'), 'user');
    input.value = '';
    setTimeout(()=> addMsg(chatBotReply(val), 'bot'), 350);
  });

  quick.addEventListener('click', e=>{
    const btn = e.target.closest('button[data-q]');
    if(!btn) return;
    const q = btn.getAttribute('data-q');
    addMsg(q, 'user');
    setTimeout(()=> addMsg(chatBotReply(q), 'bot'), 350);
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initScrollReveal();
  initNavPill();
  initFloatingWidgets();
  initAmbientBackground();
  if(document.getElementById('hero-canvas')) initOrbitGlobe('hero-canvas', {full:true, scale:0.82});

  const pageCanvas = document.getElementById('page-hero-canvas');
  if(pageCanvas){
    const scene = pageCanvas.getAttribute('data-scene') || 'orbit';
    if(scene === 'flow') initParticleFlow('page-hero-canvas', {});
    else if(scene === 'flow-light') initParticleFlow('page-hero-canvas', {light:true});
    else if(scene === 'crates') initCrateGrid('page-hero-canvas', {});
    else if(scene === 'constellation') initConstellation('page-hero-canvas', {});
    else if(scene === 'rings') initRingStack('page-hero-canvas', {});
    else if(scene === 'rings-simple') initRingStack('page-hero-canvas', {simple:true});
    else if(scene === 'radar') initRadarPing('page-hero-canvas', {});
    else initOrbitGlobe('page-hero-canvas', {full:false});
  }
});
