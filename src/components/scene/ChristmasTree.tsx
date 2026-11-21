import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { LightMode } from '../../types/wonderland';

interface ChristmasTreeProps {
  entered: boolean;
  treeLit: boolean;
  lightMode: LightMode;
  waveNonce: number;
  starBurstNonce: number;
  reducedMotion: boolean;
  isDay: boolean;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  onTreeClick: (point: [number, number, number]) => void;
  onStarClick: () => void;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Compute outer tree radius at normalized height t in [0, 1] (y from 1.05 to 5.75)
function treeRadiusAt(t: number): number {
  const base = 2.32 * Math.pow(1 - t, 0.86);
  // Subtle natural conifer tier scallop
  const tierRipple = Math.sin(t * Math.PI * 10) * 0.08 * (1 - t * 0.65);
  return Math.max(0.08, base + tierRipple);
}

// Sculpted lush evergreen pine bough fan with rich deep spruce gradient & subtle snow-kissed edge
function createPineBoughGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];

  const deepPine = new THREE.Color('#062418');
  const richSpruce = new THREE.Color('#0f442c');
  const lushEmerald = new THREE.Color('#1c643f');
  const sunlitNeedle = new THREE.Color('#287a4e');
  const softFrost = new THREE.Color('#7ca8a6'); // Subtle misty frost kiss on outermost tip

  const pushTri = (
    a: [number, number, number],
    b: [number, number, number],
    c: [number, number, number],
    ca: THREE.Color,
    cb: THREE.Color,
    cc: THREE.Color
  ) => {
    positions.push(...a, ...b, ...c);
    colors.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b, cc.r, cc.g, cc.b);
  };

  // Multi-sprig feathered pine bough (central main shoot + left/right feathered sub-sprigs)
  const addFrond = (
    ox: number,
    oy: number,
    oz: number,
    len: number,
    halfW: number,
    yaw: number,
    droopY: number,
    cRoot: THREE.Color,
    cMid: THREE.Color,
    cTip: THREE.Color
  ) => {
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const rot = (x: number, y: number, z: number): [number, number, number] => [
      ox + x * cosY + z * sinY,
      oy + y,
      oz - x * sinY + z * cosY,
    ];

    const pRoot = rot(0, 0.02, 0);
    const pRidge = rot(0, 0.065 + droopY * 0.35, len * 0.5);
    const pLeft = rot(-halfW, -0.025 + droopY * 0.55, len * 0.58);
    const pRight = rot(halfW, -0.025 + droopY * 0.55, len * 0.58);
    const pTip = rot(0, droopY, len);

    pushTri(pRoot, pLeft, pRidge, cRoot, cMid, cMid);
    pushTri(pRidge, pLeft, pTip, cMid, cMid, cTip);
    pushTri(pRoot, pRidge, pRight, cRoot, cMid, cMid);
    pushTri(pRidge, pTip, pRight, cMid, cTip, cMid);

    // Shaded underside
    const under = deepPine.clone().multiplyScalar(0.7);
    pushTri(pRoot, pRight, pLeft, under, under, under);
    pushTri(pLeft, pRight, pTip, under, under, cRoot);
  };

  // Main sweeping center spray (gently arched, soft snow kiss only on very tip)
  addFrond(0, 0.02, 0, 1.02, 0.25, 0, -0.14, deepPine, lushEmerald, sunlitNeedle.clone().lerp(softFrost, 0.36));
  // Overlapping upper fuller tuft
  addFrond(0, 0.06, 0.14, 0.72, 0.21, 0, -0.08, richSpruce, sunlitNeedle, softFrost.clone().lerp(new THREE.Color('#cfe6f5'), 0.45));
  // Feathered left & right side sprigs for thick, realistic pine fullness
  addFrond(-0.08, 0.0, 0.18, 0.68, 0.17, -0.44, -0.12, deepPine, richSpruce, lushEmerald);
  addFrond(0.08, 0.0, 0.18, 0.68, 0.17, 0.44, -0.12, deepPine, richSpruce, lushEmerald);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

// Crisp 3D diamond-faceted 5-pointed golden star geometry
function createFacetedStarGeometry(outerR = 0.44, innerR = 0.18, depth = 0.14): THREE.BufferGeometry {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 + Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }

  const positions: number[] = [];
  const frontApex: [number, number, number] = [0, 0, depth];
  const backApex: [number, number, number] = [0, 0, -depth];

  for (let i = 0; i < 10; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % 10];
    positions.push(...frontApex, x1, y1, 0, x2, y2, 0);
    positions.push(...backApex, x2, y2, 0, x1, y1, 0);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

// Graceful scalloped champagne-gold silk ribbon garland spiraling around the tree
function createSpiralRibbonGeometry(): THREE.BufferGeometry {
  const turns = 5.2;
  const segments = 260;
  const ribbonHalfWidth = 0.044;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const t = 0.05 + u * 0.88;
    const angle = u * turns * Math.PI * 2;
    const sag = Math.sin(u * turns * 6 * Math.PI) * 0.05 * (1 - t * 0.5);
    const y = 1.08 + t * 4.58 - sag;
    const r = treeRadiusAt(t) + 0.065;

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const nx = Math.cos(angle);
    const nz = Math.sin(angle);

    positions.push(
      x + nx * 0.01,
      y + ribbonHalfWidth,
      z + nz * 0.01,
      x + nx * 0.028,
      y - ribbonHalfWidth,
      z + nz * 0.028
    );
    uvs.push(u * 12, 1, u * 12, 0);

    if (i < segments) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function createCandyCaneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff9f5';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#d61f3c';
  ctx.lineWidth = 22;
  for (let i = -128; i < 256; i += 44) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 128, 128);
    ctx.stroke();
  }
  ctx.strokeStyle = '#f5d07b';
  ctx.lineWidth = 3;
  for (let i = -128; i < 256; i += 44) {
    ctx.beginPath();
    ctx.moveTo(i + 14, 0);
    ctx.lineTo(i + 142, 128);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createStarHaloTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const cx = 128;
  const cy = 128;

  const rad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 126);
  rad.addColorStop(0, 'rgba(255, 252, 224, 1)');
  rad.addColorStop(0.22, 'rgba(255, 218, 118, 0.72)');
  rad.addColorStop(0.55, 'rgba(245, 180, 72, 0.2)');
  rad.addColorStop(1, 'rgba(245, 180, 72, 0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    const len = i % 2 === 0 ? 122 : 84;
    const grad = ctx.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, 'rgba(255, 250, 220, 0.85)');
    grad.addColorStop(0.6, 'rgba(255, 215, 110, 0.16)');
    grad.addColorStop(1, 'rgba(255, 215, 110, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -4.5);
    ctx.lineTo(len, 0);
    ctx.lineTo(0, 4.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const LIGHT_PALETTES: Record<LightMode, THREE.Color[]> = {
  'warm-gold': [
    new THREE.Color('#ffd97a'),
    new THREE.Color('#ffbc54'),
    new THREE.Color('#fff2cc'),
    new THREE.Color('#ffcb66'),
  ],
  multicolor: [
    new THREE.Color('#ff3d5a'),
    new THREE.Color('#ffd25a'),
    new THREE.Color('#34eb9b'),
    new THREE.Color('#47c8ff'),
    new THREE.Color('#d282ff'),
  ],
  'ice-blue': [
    new THREE.Color('#7de8ff'),
    new THREE.Color('#e6f8ff'),
    new THREE.Color('#8bb0ff'),
    new THREE.Color('#53c6ff'),
  ],
};

const CandyCaneOrnament: React.FC<{
  position: [number, number, number];
  rotationY: number;
  geometry: THREE.TubeGeometry;
  material: THREE.MeshStandardMaterial;
}> = ({ position, rotationY, geometry, material }) => (
  <group position={position} rotation={[0.14, rotationY, 0.22]} scale={0.82}>
    <mesh geometry={geometry} material={material} />
  </group>
);

const GingerbreadOrnament: React.FC<{
  position: [number, number, number];
  rotationY: number;
}> = ({ position, rotationY }) => (
  <group position={position} rotation={[0.08, rotationY, 0.08]} scale={0.66}>
    <mesh position={[0, 0.18, 0]}>
      <sphereGeometry args={[0.095, 12, 10]} />
      <meshStandardMaterial color="#bf7138" roughness={0.72} metalness={0.05} />
    </mesh>
    <mesh position={[0, 0, 0]} scale={[1.05, 1.25, 0.55]}>
      <sphereGeometry args={[0.115, 12, 10]} />
      <meshStandardMaterial color="#bf7138" roughness={0.72} metalness={0.05} />
    </mesh>
    <mesh position={[-0.14, 0.04, 0]} rotation={[0, 0, 0.52]}>
      <capsuleGeometry args={[0.036, 0.11, 4, 8]} />
      <meshStandardMaterial color="#bf7138" roughness={0.72} />
    </mesh>
    <mesh position={[0.14, 0.04, 0]} rotation={[0, 0, -0.52]}>
      <capsuleGeometry args={[0.036, 0.11, 4, 8]} />
      <meshStandardMaterial color="#bf7138" roughness={0.72} />
    </mesh>
    <mesh position={[-0.06, -0.17, 0]} rotation={[0, 0, 0.18]}>
      <capsuleGeometry args={[0.038, 0.11, 4, 8]} />
      <meshStandardMaterial color="#bf7138" roughness={0.72} />
    </mesh>
    <mesh position={[0.06, -0.17, 0]} rotation={[0, 0, -0.18]}>
      <capsuleGeometry args={[0.038, 0.11, 4, 8]} />
      <meshStandardMaterial color="#bf7138" roughness={0.72} />
    </mesh>
    <mesh position={[-0.032, 0.2, 0.082]}>
      <sphereGeometry args={[0.015, 6, 6]} />
      <meshStandardMaterial color="#ffffff" emissive="#fff3df" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0.032, 0.2, 0.082]}>
      <sphereGeometry args={[0.015, 6, 6]} />
      <meshStandardMaterial color="#ffffff" emissive="#fff3df" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, 0.095, 0.065]}>
      <boxGeometry args={[0.085, 0.034, 0.024]} />
      <meshStandardMaterial color="#d9243d" roughness={0.35} />
    </mesh>
    <mesh position={[0, 0.025, 0.068]}>
      <sphereGeometry args={[0.019, 8, 8]} />
      <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.35} />
    </mesh>
    <mesh position={[0, -0.045, 0.065]}>
      <sphereGeometry args={[0.019, 8, 8]} />
      <meshStandardMaterial color="#27c27c" emissive="#1c8c58" emissiveIntensity={0.35} />
    </mesh>
  </group>
);

const SnowflakeOrnament: React.FC<{
  position: [number, number, number];
  rotationY: number;
}> = ({ position, rotationY }) => (
  <group position={position} rotation={[0.1, rotationY, 0]} scale={0.74}>
    {[0, 1, 2].map((arm) => (
      <mesh key={arm} rotation={[0, 0, (arm * Math.PI) / 3]}>
        <boxGeometry args={[0.28, 0.024, 0.016]} />
        <meshStandardMaterial
          color="#eaf7ff"
          emissive="#a6e2ff"
          emissiveIntensity={0.85}
          metalness={0.45}
          roughness={0.18}
        />
      </mesh>
    ))}
    <mesh>
      <octahedronGeometry args={[0.045, 0]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#d2f3ff"
        emissiveIntensity={1.15}
        toneMapped={false}
      />
    </mesh>
  </group>
);

const GoldenBellOrnament: React.FC<{
  position: [number, number, number];
  rotationY: number;
}> = ({ position, rotationY }) => (
  <group position={position} rotation={[0.12, rotationY, 0.06]} scale={0.82}>
    <mesh position={[0, 0, 0]}>
      <coneGeometry args={[0.085, 0.145, 14, 1, false]} />
      <meshStandardMaterial color="#f5cc66" metalness={0.9} roughness={0.16} emissive="#5e410d" emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[0, -0.068, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.082, 0.015, 8, 16]} />
      <meshStandardMaterial color="#ffe08a" metalness={0.92} roughness={0.14} />
    </mesh>
    <mesh position={[0, -0.085, 0]}>
      <sphereGeometry args={[0.026, 8, 8]} />
      <meshStandardMaterial color="#e0aa3e" metalness={0.9} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.082, 0]}>
      <boxGeometry args={[0.085, 0.032, 0.032]} />
      <meshStandardMaterial color="#c91f38" roughness={0.35} />
    </mesh>
  </group>
);

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({
  entered,
  treeLit,
  lightMode,
  waveNonce,
  starBurstNonce,
  reducedMotion,
  isDay,
  pointerRef,
  onTreeClick,
  onStarClick,
}) => {
  const treeGroupRef = useRef<THREE.Group>(null);
  const boughMeshRef = useRef<THREE.InstancedMesh>(null);
  const ledMeshRef = useRef<THREE.InstancedMesh>(null);
  const baubleRedRef = useRef<THREE.InstancedMesh>(null);
  const baubleGoldRef = useRef<THREE.InstancedMesh>(null);
  const baubleSilverRef = useRef<THREE.InstancedMesh>(null);
  const baubleCapRef = useRef<THREE.InstancedMesh>(null);
  const starGroupRef = useRef<THREE.Group>(null);
  const starHaloRef = useRef<THREE.Sprite>(null);
  const starLightRef = useRef<THREE.PointLight>(null);
  const treeCoreLightRef = useRef<THREE.PointLight>(null);
  const magicParticlesRef = useRef<THREE.Points>(null);

  const [starHovered, setStarHovered] = useState(false);

  const litProgressRef = useRef(0);
  const waveProgressRef = useRef(2.0);
  const lastWaveNonceRef = useRef(waveNonce);
  const starFlareRef = useRef(0);
  const lastStarBurstNonceRef = useRef(starBurstNonce);

  const boughGeo = useMemo(() => createPineBoughGeometry(), []);
  const starGeo = useMemo(() => createFacetedStarGeometry(0.45, 0.185, 0.145), []);
  const ribbonGeo = useMemo(() => createSpiralRibbonGeometry(), []);
  const starHaloTex = useMemo(() => createStarHaloTexture(), []);
  const candyTex = useMemo(() => createCandyCaneTexture(), []);

  const candyCaneGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.2, 0),
      new THREE.Vector3(0, 0.08, 0),
      new THREE.Vector3(0.025, 0.17, 0),
      new THREE.Vector3(0.095, 0.195, 0),
      new THREE.Vector3(0.14, 0.135, 0),
    ]);
    return new THREE.TubeGeometry(curve, 22, 0.026, 10, false);
  }, []);

  const candyCaneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: candyTex,
        roughness: 0.25,
        metalness: 0.08,
      }),
    [candyTex]
  );

  const treeData = useMemo(() => {
    const rng = mulberry32(20261225);

    // 1. Lush Layered Pine Boughs (640 dense overlapping feathered spruce boughs across 13 tiers)
    const boughs: { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 }[] = [];
    const tiers = 13;

    for (let tier = 0; tier < tiers; tier++) {
      const tTier = tier / (tiers - 1);
      const yBase = 1.08 + tTier * 4.58;
      const tierRadius = treeRadiusAt(tTier);
      const countInTier = Math.round(76 * (1 - tTier * 0.72) + 12);

      for (let i = 0; i < countInTier; i++) {
        const angle = (i / countInTier) * Math.PI * 2 + tier * 0.67 + (rng() - 0.5) * 0.18;
        const radialOffset = (0.18 + rng() * 0.28) * tierRadius;
        const y = yBase + (rng() - 0.5) * 0.22;
        const boughLen = Math.max(0.32, tierRadius * (0.68 + rng() * 0.26));
        const boughWidth = Math.max(0.42, (1.18 - tTier * 0.62) * (0.88 + rng() * 0.26));
        // Gentle graceful outward sweep (never poking vertically down into gifts!)
        const droop = 0.08 + (1 - tTier) * 0.12 + (rng() - 0.5) * 0.08;

        boughs.push({
          pos: new THREE.Vector3(Math.cos(angle) * radialOffset, y, Math.sin(angle) * radialOffset),
          rot: new THREE.Euler(droop, -angle + Math.PI / 2, (rng() - 0.5) * 0.14, 'YXZ'),
          scale: new THREE.Vector3(boughWidth, boughWidth * 0.85, boughLen),
        });
      }
    }

    // 2. 480 Twinkling LED Fairy Lights spiraling densely through the spruce boughs
    const leds: {
      pos: THREE.Vector3;
      t: number;
      phase: number;
      speed: number;
      paletteSlot: number;
      baseScale: number;
    }[] = [];

    const ledCount = 480;
    for (let i = 0; i < ledCount; i++) {
      const frac = i / ledCount;
      const t = 1 - Math.pow(1 - frac, 0.72);
      const angle = frac * Math.PI * 2 * 24.5 + (rng() - 0.5) * 0.42;
      const r = treeRadiusAt(t) * (0.94 + rng() * 0.11);
      const y = 1.08 + t * 4.6 + (rng() - 0.5) * 0.08;
      leds.push({
        pos: new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r),
        t,
        phase: rng() * Math.PI * 2,
        speed: 1.4 + rng() * 2.5,
        paletteSlot: Math.floor(rng() * 5),
        baseScale: 0.78 + rng() * 0.52,
      });
    }

    // 3. 84 Glossy Metallic Baubles (Red, Gold, Silver)
    const redBaubles: { pos: THREE.Vector3; scale: number }[] = [];
    const goldBaubles: { pos: THREE.Vector3; scale: number }[] = [];
    const silverBaubles: { pos: THREE.Vector3; scale: number }[] = [];

    const totalBaubles = 84;
    for (let i = 0; i < totalBaubles; i++) {
      const frac = (i + 0.5) / totalBaubles;
      const t = 0.05 + (1 - Math.pow(1 - frac, 0.78)) * 0.86;
      const angle = i * 2.39996 + (rng() - 0.5) * 0.24;
      const r = treeRadiusAt(t) * (0.95 + rng() * 0.08);
      const y = 1.1 + t * 4.55;
      const scale = (0.098 + rng() * 0.042) * (1.06 - t * 0.24);
      const item = { pos: new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r), scale };
      if (i % 3 === 0) redBaubles.push(item);
      else if (i % 3 === 1) goldBaubles.push(item);
      else silverBaubles.push(item);
    }

    // 4. Special 3D Ornaments: Bells, Candy Canes, Gingerbread Men, Snowflakes
    const placeSpecial = (count: number, offsetAngle: number, tMin: number, tMax: number) => {
      const list: { pos: [number, number, number]; rotY: number }[] = [];
      for (let i = 0; i < count; i++) {
        const frac = (i + 0.35) / count;
        const t = tMin + frac * (tMax - tMin);
        const angle = offsetAngle + i * 2.41 + (rng() - 0.5) * 0.2;
        const r = treeRadiusAt(t) * 1.03;
        const y = 1.12 + t * 4.5;
        list.push({
          pos: [Math.cos(angle) * r, y, Math.sin(angle) * r],
          rotY: -angle + Math.PI / 2,
        });
      }
      return list;
    };

    const bells = placeSpecial(16, 0.3, 0.08, 0.84);
    const candyCanes = placeSpecial(14, 1.4, 0.08, 0.8);
    const gingerbreads = placeSpecial(10, 2.5, 0.1, 0.72);
    const snowflakes = placeSpecial(14, 3.6, 0.12, 0.88);

    // 5. Orbiting Golden Magic Particles
    const moteCount = 160;
    const moteBasePositions = new Float32Array(moteCount * 3);
    const moteMeta: { angle: number; radius: number; y: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < moteCount; i++) {
      const y = 0.6 + rng() * 5.8;
      const t = Math.max(0, Math.min(1, (y - 1.0) / 4.8));
      const radius = treeRadiusAt(t) + 0.35 + rng() * 1.5;
      const angle = rng() * Math.PI * 2;
      moteMeta.push({
        angle,
        radius,
        y,
        speed: 0.12 + rng() * 0.24,
        phase: rng() * Math.PI * 2,
      });
      moteBasePositions[i * 3] = Math.cos(angle) * radius;
      moteBasePositions[i * 3 + 1] = y;
      moteBasePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    return {
      boughs,
      leds,
      redBaubles,
      goldBaubles,
      silverBaubles,
      bells,
      candyCanes,
      gingerbreads,
      snowflakes,
      moteBasePositions,
      moteMeta,
    };
  }, []);

  React.useLayoutEffect(() => {
    const dummy = new THREE.Object3D();

    if (boughMeshRef.current) {
      treeData.boughs.forEach((b, i) => {
        dummy.position.copy(b.pos);
        dummy.rotation.copy(b.rot);
        dummy.scale.copy(b.scale);
        dummy.updateMatrix();
        boughMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      boughMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    const populateBaubles = (
      mesh: THREE.InstancedMesh | null,
      list: { pos: THREE.Vector3; scale: number }[]
    ) => {
      if (!mesh) return;
      list.forEach((b, i) => {
        dummy.position.copy(b.pos);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(b.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };

    populateBaubles(baubleRedRef.current, treeData.redBaubles);
    populateBaubles(baubleGoldRef.current, treeData.goldBaubles);
    populateBaubles(baubleSilverRef.current, treeData.silverBaubles);

    if (baubleCapRef.current) {
      const all = [...treeData.redBaubles, ...treeData.goldBaubles, ...treeData.silverBaubles];
      all.forEach((b, i) => {
        dummy.position.set(b.pos.x, b.pos.y + b.scale * 0.96, b.pos.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(b.scale * 0.35);
        dummy.updateMatrix();
        baubleCapRef.current!.setMatrixAt(i, dummy.matrix);
      });
      baubleCapRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [treeData]);

  const dummyObj = useMemo(() => new THREE.Object3D(), []);
  const scratchColor = useMemo(() => new THREE.Color(), []);
  const whiteFlare = useMemo(() => new THREE.Color('#fff9e2'), []);
  const offColor = useMemo(() => new THREE.Color('#0c1b14'), []);

  const moteMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uOpacity: { value: 0 },
          uColor: { value: new THREE.Color('#ffe08c') },
        },
        vertexShader: `
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = clamp(44.0 / -mvPosition.z, 2.0, 12.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          uniform vec3 uColor;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float glow = pow(1.0 - d * 2.0, 2.2);
            gl_FragColor = vec4(uColor * 1.5, glow * uOpacity);
          }
        `,
      }),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    if (waveNonce !== lastWaveNonceRef.current) {
      lastWaveNonceRef.current = waveNonce;
      waveProgressRef.current = -0.15;
    }
    if (starBurstNonce !== lastStarBurstNonceRef.current) {
      lastStarBurstNonceRef.current = starBurstNonce;
      starFlareRef.current = 1.0;
    }

    const targetLit = entered && treeLit ? 1.0 : 0.0;
    const litSpeed = targetLit > litProgressRef.current ? 0.52 : 1.35;
    litProgressRef.current = THREE.MathUtils.lerp(
      litProgressRef.current,
      targetLit,
      Math.min(1, dt * litSpeed * 2.2)
    );
    if (Math.abs(litProgressRef.current - targetLit) < 0.002) {
      litProgressRef.current = targetLit;
    }

    if (waveProgressRef.current < 1.55) {
      waveProgressRef.current += dt * (reducedMotion ? 0.85 : 1.05);
    }

    if (starFlareRef.current > 0) {
      starFlareRef.current = Math.max(0, starFlareRef.current - dt * 0.72);
    }

    if (treeGroupRef.current) {
      const parallaxAmp = reducedMotion ? 0.08 : 0.26;
      const idleSway = reducedMotion ? 0 : Math.sin(t * 0.25) * 0.05;
      const targetRotY = pointerRef.current.x * parallaxAmp + idleSway;
      const targetRotX = -pointerRef.current.y * (reducedMotion ? 0.02 : 0.055);
      treeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        treeGroupRef.current.rotation.y,
        targetRotY,
        dt * 3.2
      );
      treeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        treeGroupRef.current.rotation.x,
        targetRotX,
        dt * 3.0
      );
    }

    const breathe = reducedMotion ? 0.94 : 0.84 + 0.16 * Math.sin(t * 1.2);
    const palette = LIGHT_PALETTES[lightMode];
    const litProg = litProgressRef.current;
    const wavePos = waveProgressRef.current;

    if (ledMeshRef.current) {
      for (let i = 0; i < treeData.leds.length; i++) {
        const led = treeData.leds[i];
        const localLit = THREE.MathUtils.smoothstep(litProg * 1.28 - led.t * 0.82, 0, 0.36);

        const twinkle = reducedMotion
          ? 0.88 + 0.12 * Math.sin(t * 0.9 + led.phase)
          : 0.56 + 0.44 * Math.sin(t * led.speed + led.phase);

        const waveDist = Math.abs(led.t - wavePos);
        const waveBoost = waveDist < 0.2 ? Math.cos((waveDist / 0.2) * (Math.PI / 2)) : 0;

        const bulbScale = 0.03 * led.baseScale * (0.85 + localLit * 0.35 + waveBoost * 0.65);
        dummyObj.position.copy(led.pos);
        dummyObj.scale.setScalar(bulbScale);
        dummyObj.updateMatrix();
        ledMeshRef.current.setMatrixAt(i, dummyObj.matrix);

        const baseCol = palette[led.paletteSlot % palette.length];
        scratchColor.copy(baseCol);
        if (waveBoost > 0.02) {
          scratchColor.lerp(whiteFlare, waveBoost * 0.72);
        }

        const dayAdjust = isDay ? 0.82 : 1.08;
        const intensity = localLit * (0.9 + twinkle * 1.85) * breathe * dayAdjust + waveBoost * 2.8;
        if (localLit < 0.02) {
          scratchColor.copy(offColor);
        } else {
          scratchColor.multiplyScalar(intensity);
        }
        ledMeshRef.current.setColorAt(i, scratchColor);
      }
      ledMeshRef.current.instanceMatrix.needsUpdate = true;
      if (ledMeshRef.current.instanceColor) {
        ledMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (treeCoreLightRef.current) {
      const modeColor =
        lightMode === 'ice-blue' ? '#84d8ff' : lightMode === 'multicolor' ? '#ffd088' : '#ffc663';
      treeCoreLightRef.current.color.set(modeColor);
      treeCoreLightRef.current.intensity =
        litProg * (isDay ? 2.4 : 6.4) * breathe + (wavePos < 1.3 ? 3.8 : 0);
    }

    const starLit = THREE.MathUtils.smoothstep(litProg, 0.55, 1.0);
    const starPulse = 0.9 + 0.1 * Math.sin(t * 2.1);
    const flare = starFlareRef.current;

    if (starGroupRef.current) {
      starGroupRef.current.rotation.y = t * (reducedMotion ? 0.15 : 0.42) + flare * 2.4;
      const hoverBoost = starHovered ? 1.12 : 1.0;
      const s = (0.94 + starLit * 0.12 + flare * 0.25) * hoverBoost;
      starGroupRef.current.scale.setScalar(s);
    }

    if (starHaloRef.current) {
      const haloScale =
        (1.65 + starPulse * 0.25 + flare * 1.85 + (starHovered ? 0.35 : 0)) * (0.2 + starLit * 0.85);
      starHaloRef.current.scale.set(haloScale, haloScale, 1);
      (starHaloRef.current.material as THREE.SpriteMaterial).opacity =
        (0.12 + starLit * (isDay ? 0.52 : 0.88) + flare * 0.35) * starPulse;
    }

    if (starLightRef.current) {
      starLightRef.current.intensity = starLit * (isDay ? 3.0 : 8.5) * starPulse + flare * 12.0;
    }

    if (magicParticlesRef.current) {
      const posAttr = magicParticlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      const speedMul = reducedMotion ? 0.25 : 1.0;
      for (let i = 0; i < treeData.moteMeta.length; i++) {
        const m = treeData.moteMeta[i];
        const ang = m.angle + t * m.speed * speedMul;
        const y = ((m.y + t * 0.14 * speedMul - 0.6) % 5.8) + 0.6;
        const wobble = Math.sin(t * 1.4 + m.phase) * 0.14;
        posAttr.setXYZ(i, Math.cos(ang) * (m.radius + wobble), y, Math.sin(ang) * (m.radius + wobble));
      }
      posAttr.needsUpdate = true;

      moteMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        moteMaterial.uniforms.uOpacity.value,
        litProg * (isDay ? 0.38 : 0.88),
        dt * 2.5
      );
      moteMaterial.uniforms.uColor.value.set(lightMode === 'ice-blue' ? '#a6ecff' : '#ffe08c');
    }
  });

  const handleTreePointerDown = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const p = e.point;
    onTreeClick([p.x, p.y, p.z]);
  };

  const handleStarPointerDown = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onStarClick();
  };

  return (
    <group ref={treeGroupRef} position={[0, 0, 0]}>
      {/* Crimson & Gold Velvet Tree Skirt nestled on the snow */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.65, 2.05, 0.06, 40]} />
        <meshStandardMaterial color="#8f1429" roughness={0.86} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.52, 1.66, 48]} />
        <meshStandardMaterial color="#e5b85b" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* Rich Cedar Tree Trunk */}
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.4, 1.3, 14]} />
        <meshStandardMaterial color="#4a2b18" roughness={0.92} metalness={0.02} />
      </mesh>

      {/* Dense Inner Conifer Core (ensures rich deep green fullness + reliable click target) */}
      <mesh
        position={[0, 3.38, 0]}
        castShadow
        receiveShadow
        onClick={handleTreePointerDown}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <coneGeometry args={[2.06, 4.72, 24]} />
        <meshStandardMaterial color="#08281c" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* 640 Sculpted Layered Feathered Pine Boughs */}
      <instancedMesh
        ref={boughMeshRef}
        args={[boughGeo, undefined, treeData.boughs.length]}
        castShadow
        receiveShadow
        onClick={handleTreePointerDown}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial vertexColors roughness={0.82} metalness={0.04} />
      </instancedMesh>

      {/* Flowing Champagne-Gold Silk Ribbon Garland */}
      <mesh geometry={ribbonGeo} castShadow>
        <meshStandardMaterial
          color="#f7d374"
          emissive="#8a5e14"
          emissiveIntensity={0.48}
          metalness={0.86}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 480 Twinkling HDR LED Fairy Lights */}
      <instancedMesh ref={ledMeshRef} args={[undefined, undefined, treeData.leds.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial toneMapped={false} color="#ffffff" />
      </instancedMesh>

      {/* Glossy Christmas Baubles — Crimson, Champagne Gold, Silver */}
      <instancedMesh ref={baubleRedRef} args={[undefined, undefined, treeData.redBaubles.length]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#d41d3b"
          emissive="#4c0612"
          emissiveIntensity={0.38}
          metalness={0.82}
          roughness={0.14}
        />
      </instancedMesh>
      <instancedMesh ref={baubleGoldRef} args={[undefined, undefined, treeData.goldBaubles.length]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#f5c95e"
          emissive="#5c3e0a"
          emissiveIntensity={0.34}
          metalness={0.9}
          roughness={0.14}
        />
      </instancedMesh>
      <instancedMesh ref={baubleSilverRef} args={[undefined, undefined, treeData.silverBaubles.length]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#e8f1fc"
          emissive="#253447"
          emissiveIntensity={0.28}
          metalness={0.9}
          roughness={0.12}
        />
      </instancedMesh>
      <instancedMesh
        ref={baubleCapRef}
        args={[
          undefined,
          undefined,
          treeData.redBaubles.length + treeData.goldBaubles.length + treeData.silverBaubles.length,
        ]}
      >
        <cylinderGeometry args={[0.7, 0.85, 0.9, 8]} />
        <meshStandardMaterial color="#f5d07b" metalness={0.92} roughness={0.18} />
      </instancedMesh>

      {/* 3D Jingle Bells */}
      {treeData.bells.map((item, idx) => (
        <GoldenBellOrnament key={`bell-${idx}`} position={item.pos} rotationY={item.rotY} />
      ))}

      {/* 3D Peppermint Candy Canes */}
      {treeData.candyCanes.map((item, idx) => (
        <CandyCaneOrnament
          key={`cane-${idx}`}
          position={item.pos}
          rotationY={item.rotY}
          geometry={candyCaneGeo}
          material={candyCaneMat}
        />
      ))}

      {/* 3D Gingerbread Men */}
      {treeData.gingerbreads.map((item, idx) => (
        <GingerbreadOrnament key={`ginger-${idx}`} position={item.pos} rotationY={item.rotY} />
      ))}

      {/* 3D Crystalline Snowflakes */}
      {treeData.snowflakes.map((item, idx) => (
        <SnowflakeOrnament key={`flake-${idx}`} position={item.pos} rotationY={item.rotY} />
      ))}

      {/* Golden Spire Mount for Topper Star */}
      <mesh position={[0, 5.7, 0]}>
        <cylinderGeometry args={[0.028, 0.06, 0.34, 10]} />
        <meshStandardMaterial color="#f2c45a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Radiant 5-Pointed Golden Star Topper */}
      <group
        ref={starGroupRef}
        position={[0, 6.02, 0]}
        onClick={handleStarPointerDown}
        onPointerOver={(e) => {
          e.stopPropagation();
          setStarHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setStarHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh geometry={starGeo}>
          <meshStandardMaterial
            color="#fff2b5"
            emissive="#ffca4f"
            emissiveIntensity={entered && treeLit ? 2.7 : 0.35}
            metalness={0.75}
            roughness={0.12}
            toneMapped={false}
          />
        </mesh>
        <mesh visible={false}>
          <sphereGeometry args={[0.56, 12, 12]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      {/* Volumetric Glowing Star Halo Rays */}
      <sprite ref={starHaloRef} position={[0, 6.02, 0]}>
        <spriteMaterial
          map={starHaloTex}
          color="#ffe28a"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* Warm Tree Lights */}
      <pointLight
        ref={starLightRef}
        position={[0, 6.05, 0.35]}
        color="#ffd470"
        intensity={0}
        distance={15}
        decay={1.8}
      />
      <pointLight
        ref={treeCoreLightRef}
        position={[0, 2.7, 0.7]}
        color="#ffc866"
        intensity={0}
        distance={14}
        decay={1.7}
      />

      {/* Floating Golden Magic Motes Orbiting the Tree */}
      <points ref={magicParticlesRef} material={moteMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={treeData.moteMeta.length}
            array={treeData.moteBasePositions}
            itemSize={3}
          />
        </bufferGeometry>
      </points>
    </group>
  );
};
