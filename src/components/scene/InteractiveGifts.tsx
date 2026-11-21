import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { GiftBoxDef } from '../../types/wonderland';

export const GIFT_DEFINITIONS: GiftBoxDef[] = [
  {
    id: 'gift-crimson',
    position: [-1.45, 0, 1.48],
    size: [0.68, 0.56, 0.68],
    rotationY: 0.35,
    wrapColor: '#c41e3a',
    wrapAccent: '#f5d07b',
    ribbonColor: '#f5d07b',
    pattern: 'stripes',
    glowColor: '#ff7086',
    label: '緋紅金緞禮盒',
  },
  {
    id: 'gift-emerald',
    position: [-0.52, 0, 1.98],
    size: [0.58, 0.46, 0.58],
    rotationY: -0.22,
    wrapColor: '#135c3d',
    wrapAccent: '#f8e09e',
    ribbonColor: '#e02f4b',
    pattern: 'stars',
    glowColor: '#56e39f',
    label: '松綠星辰禮盒',
  },
  {
    id: 'gift-champagne',
    position: [0.46, 0, 2.02],
    size: [0.64, 0.62, 0.56],
    rotationY: 0.18,
    wrapColor: '#e8c474',
    wrapAccent: '#fff6d9',
    ribbonColor: '#b81d38',
    pattern: 'dots',
    glowColor: '#ffd978',
    label: '香檳金耀禮盒',
  },
  {
    id: 'gift-sapphire',
    position: [1.42, 0, 1.44],
    size: [0.7, 0.52, 0.66],
    rotationY: -0.42,
    wrapColor: '#1b3f7a',
    wrapAccent: '#a8d8ff',
    ribbonColor: '#e8f3ff',
    pattern: 'stars',
    glowColor: '#75c7ff',
    label: '星夜冰藍禮盒',
  },
  {
    id: 'gift-ivory',
    position: [1.96, 0, 0.42],
    size: [0.56, 0.48, 0.56],
    rotationY: 0.58,
    wrapColor: '#f6efe4',
    wrapAccent: '#d92b45',
    ribbonColor: '#c41e3a',
    pattern: 'plaid',
    glowColor: '#ffe8bd',
    label: '雪白暖紅禮盒',
  },
  {
    id: 'gift-burgundy',
    position: [-1.96, 0, 0.48],
    size: [0.62, 0.68, 0.54],
    rotationY: -0.52,
    wrapColor: '#781733',
    wrapAccent: '#f5c77e',
    ribbonColor: '#f5d07b',
    pattern: 'dots',
    glowColor: '#ff96aa',
    label: '酒紅星願禮盒',
  },
  {
    id: 'gift-forest',
    position: [0.02, 0, 1.25],
    size: [0.52, 0.42, 0.52],
    rotationY: 0.1,
    wrapColor: '#b61c34',
    wrapAccent: '#ffe29a',
    ribbonColor: '#fff4d4',
    pattern: 'plaid',
    glowColor: '#ffc86e',
    label: '聖誕奇蹟小盒',
  },
];

function createWrapTexture(base: string, accent: string, pattern: GiftBoxDef['pattern']): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 128, 128);

  if (pattern === 'stripes') {
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.34;
    ctx.lineWidth = 10;
    for (let i = -128; i < 256; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 128, 128);
      ctx.stroke();
    }
  } else if (pattern === 'dots') {
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.48;
    for (let y = 16; y < 128; y += 32) {
      for (let x = 16; x < 128; x += 32) {
        ctx.beginPath();
        ctx.arc(x + ((y / 32) % 2) * 14, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'plaid') {
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 128; i += 32) {
      ctx.fillRect(i, 0, 8, 128);
      ctx.fillRect(0, i, 128, 8);
    }
    ctx.globalAlpha = 0.5;
    for (let i = 14; i < 128; i += 32) {
      ctx.fillRect(i, 0, 2, 128);
      ctx.fillRect(0, i, 128, 2);
    }
  } else {
    // Festive stars
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.52;
    const drawStar = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.44;
        const px = cx + Math.cos(a) * rad;
        const py = cy + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    };
    drawStar(32, 32, 10);
    drawStar(96, 32, 7);
    drawStar(64, 68, 9);
    drawStar(28, 100, 7);
    drawStar(98, 98, 10);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface BurstParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  size: number;
  age: number;
  life: number;
  rotSpeed: number;
}

interface SingleGiftProps {
  gift: GiftBoxDef;
  isOpened: boolean;
  openCount: number;
  entered: boolean;
  isDay: boolean;
  onSelect: (gift: GiftBoxDef) => void;
}

const SingleGiftBox: React.FC<SingleGiftProps> = ({
  gift,
  isOpened,
  openCount,
  entered,
  isDay,
  onSelect,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const lidPivotRef = useRef<THREE.Group>(null);
  const ribbonRef = useRef<THREE.Group>(null);
  const innerGlowRef = useRef<THREE.PointLight>(null);
  const snowPoolRef = useRef<THREE.Mesh>(null);
  const burstMeshRef = useRef<THREE.InstancedMesh>(null);

  const [hovered, setHovered] = useState(false);

  const animTimeRef = useRef(99);
  const lastOpenCountRef = useRef(openCount);
  const particlesRef = useRef<BurstParticle[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const [w, h, d] = gift.size;
  const lidH = Math.max(0.08, h * 0.22);
  const baseH = h - lidH * 0.5;

  const wrapTex = useMemo(
    () => createWrapTexture(gift.wrapColor, gift.wrapAccent, gift.pattern),
    [gift.wrapColor, gift.wrapAccent, gift.pattern]
  );

  // Spawn colorful burst particles inside the gift when opened
  const spawnBurst = () => {
    const palette = ['#ffe285', '#ff4d6d', '#6ee7ff', '#fff9e6', '#56f0a5', '#f5c259'];
    const list: BurstParticle[] = [];
    for (let i = 0; i < 42; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.7 + Math.random() * 1.9;
      list.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * w * 0.4, h * 0.7, (Math.random() - 0.5) * d * 0.4),
        vel: new THREE.Vector3(
          Math.cos(ang) * spd,
          2.2 + Math.random() * 2.4,
          Math.sin(ang) * spd
        ),
        color: new THREE.Color(palette[i % palette.length]),
        size: 0.032 + Math.random() * 0.036,
        age: 0,
        life: 1.45 + Math.random() * 0.85,
        rotSpeed: (Math.random() - 0.5) * 9,
      });
    }
    particlesRef.current = list;
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Trigger opening animation on new click
    if (openCount !== lastOpenCountRef.current) {
      lastOpenCountRef.current = openCount;
      if (isOpened) {
        animTimeRef.current = 0;
        spawnBurst();
      } else {
        animTimeRef.current = 99;
        particlesRef.current = [];
      }
    }

    if (isOpened) {
      animTimeRef.current += dt;
    }

    const at = animTimeRef.current;

    // 1. Wiggle/shake (0.0 -> 0.42s), then settle
    if (rootRef.current) {
      let shakeZ = 0;
      let shakeY = 0;
      if (isOpened && at < 0.44) {
        const decay = 1 - at / 0.44;
        shakeZ = Math.sin(at * 38) * 0.14 * decay;
        shakeY = Math.abs(Math.sin(at * 19)) * 0.06 * decay;
      } else if (hovered && !isOpened) {
        shakeZ = Math.sin(t * 7) * 0.035;
        shakeY = 0.025 + Math.sin(t * 4) * 0.015;
      }
      rootRef.current.rotation.z = THREE.MathUtils.lerp(rootRef.current.rotation.z, shakeZ, dt * 16);
      rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, shakeY, dt * 14);
    }

    // 2. Ribbon untie & spread outward (0.28 -> 0.65s)
    if (ribbonRef.current) {
      const untieProg = isOpened ? THREE.MathUtils.clamp((at - 0.25) / 0.45, 0, 1) : 0;
      const s = 1 + untieProg * 0.28;
      ribbonRef.current.scale.set(s, 1 - untieProg * 0.85, s);
      ribbonRef.current.visible = untieProg < 0.98;
    }

    // 3. Lid pop open on rear hinge with elastic bounce (starts at 0.36s)
    if (lidPivotRef.current) {
      let targetAngle = 0;
      if (isOpened && at > 0.34) {
        const popT = THREE.MathUtils.clamp((at - 0.34) / 0.55, 0, 1);
        // Springy ease-out overshoot
        const elastic =
          popT < 1
            ? 1 - Math.pow(1 - popT, 3) * Math.cos(popT * Math.PI * 1.8)
            : 1;
        targetAngle = -1.92 * elastic;
      }
      lidPivotRef.current.rotation.x = THREE.MathUtils.lerp(
        lidPivotRef.current.rotation.x,
        targetAngle,
        dt * 12
      );
    }

    // 4. Inner golden light beam when lid pops
    if (innerGlowRef.current) {
      const openGlow = isOpened && at > 0.36 ? Math.min(1, (at - 0.36) * 2.5) : 0;
      const pulse = 0.82 + 0.18 * Math.sin(t * 3.2);
      innerGlowRef.current.intensity = openGlow * 3.8 * pulse;
    }

    // 5. Subtle glowing snow ring beneath gift box
    if (snowPoolRef.current) {
      const mat = snowPoolRef.current.material as THREE.MeshBasicMaterial;
      const pulse = 0.65 + 0.35 * Math.sin(t * 2.0 + gift.position[0] * 2);
      const baseAlpha = entered ? (isDay ? 0.14 : 0.32) : 0.05;
      mat.opacity = baseAlpha * pulse * (hovered ? 1.65 : 1.0) + (isOpened ? 0.18 : 0);
    }

    // 6. Update 3D burst particles (stars/confetti/sparkles)
    if (burstMeshRef.current) {
      const particles = particlesRef.current;
      let anyAlive = false;
      for (let i = 0; i < 42; i++) {
        const p = particles[i];
        if (!p || p.age >= p.life || (isOpened && at < 0.34)) {
          dummy.position.set(0, -10, 0);
          dummy.scale.setScalar(0.0001);
          dummy.updateMatrix();
          burstMeshRef.current.setMatrixAt(i, dummy.matrix);
          continue;
        }
        anyAlive = true;
        p.age += dt;
        p.vel.y -= 4.2 * dt; // Gravity
        p.vel.multiplyScalar(1 - 0.6 * dt); // Gentle air drag
        p.pos.addScaledVector(p.vel, dt);

        const fade = Math.max(0, 1 - p.age / p.life);
        dummy.position.copy(p.pos);
        dummy.rotation.set(p.age * p.rotSpeed, p.age * p.rotSpeed * 0.7, p.age * 2);
        dummy.scale.setScalar(p.size * fade * 1.4);
        dummy.updateMatrix();
        burstMeshRef.current.setMatrixAt(i, dummy.matrix);
        burstMeshRef.current.setColorAt(i, p.color);
      }
      if (anyAlive || particles.length === 0) {
        burstMeshRef.current.instanceMatrix.needsUpdate = true;
        if (burstMeshRef.current.instanceColor) {
          burstMeshRef.current.instanceColor.needsUpdate = true;
        }
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(gift);
  };

  return (
    <group position={gift.position} rotation={[0, gift.rotationY, 0]}>
      {/* Soft Glowing Halo Pool on the Snow */}
      <mesh ref={snowPoolRef} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(w, d) * 0.92, 24]} />
        <meshBasicMaterial
          color={gift.glowColor}
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <group
        ref={rootRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Gift Box Body */}
        <mesh position={[0, baseH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, baseH, d]} />
          <meshStandardMaterial
            map={wrapTex}
            roughness={0.42}
            metalness={0.12}
            emissive={hovered ? gift.glowColor : '#000000'}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        </mesh>

        {/* Warm Golden Interior Glowing Core */}
        <mesh position={[0, baseH * 0.92, 0]}>
          <boxGeometry args={[w * 0.88, 0.04, d * 0.88]} />
          <meshBasicMaterial color="#ffe28c" toneMapped={false} />
        </mesh>
        <pointLight
          ref={innerGlowRef}
          position={[0, baseH + 0.15, 0]}
          color="#ffd770"
          intensity={0}
          distance={3.2}
          decay={2}
        />

        {/* Satin Cross Ribbons on Body (Untie & fade when clicked) */}
        <group ref={ribbonRef} position={[0, baseH / 2, 0]}>
          <mesh>
            <boxGeometry args={[w + 0.018, baseH + 0.01, w * 0.16]} />
            <meshStandardMaterial
              color={gift.ribbonColor}
              metalness={0.52}
              roughness={0.28}
              emissive={gift.ribbonColor}
              emissiveIntensity={0.16}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[w * 0.16, baseH + 0.01, d + 0.018]} />
            <meshStandardMaterial
              color={gift.ribbonColor}
              metalness={0.52}
              roughness={0.28}
              emissive={gift.ribbonColor}
              emissiveIntensity={0.16}
            />
          </mesh>
        </group>

        {/* Hinged Gift Lid + Sculpted Double Bow */}
        <group ref={lidPivotRef} position={[0, baseH, -d / 2]}>
          <group position={[0, lidH / 2, d / 2]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[w + 0.045, lidH, d + 0.045]} />
              <meshStandardMaterial map={wrapTex} roughness={0.38} metalness={0.14} />
            </mesh>
            {/* Lid cross ribbons */}
            <mesh>
              <boxGeometry args={[w + 0.058, lidH + 0.01, w * 0.16]} />
              <meshStandardMaterial color={gift.ribbonColor} metalness={0.58} roughness={0.25} />
            </mesh>
            <mesh>
              <boxGeometry args={[w * 0.16, lidH + 0.01, d + 0.058]} />
              <meshStandardMaterial color={gift.ribbonColor} metalness={0.58} roughness={0.25} />
            </mesh>

            {/* Sculpted Ribbon Bow on Top of Lid */}
            <group position={[0, lidH / 2 + 0.045, 0]}>
              {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
                <mesh
                  key={i}
                  position={[Math.cos(ang) * 0.065, 0.015, Math.sin(ang) * 0.065]}
                  rotation={[0.45, -ang, 0.3]}
                  scale={[1, 0.65, 0.7]}
                >
                  <torusGeometry args={[0.062, 0.02, 8, 16]} />
                  <meshStandardMaterial
                    color={gift.ribbonColor}
                    metalness={0.62}
                    roughness={0.24}
                  />
                </mesh>
              ))}
              <mesh position={[0, 0.01, 0]}>
                <sphereGeometry args={[0.036, 10, 10]} />
                <meshStandardMaterial color={gift.ribbonColor} metalness={0.65} roughness={0.22} />
              </mesh>
            </group>
          </group>
        </group>

        {/* 3D Bursting Stars, Confetti & Sparkles */}
        <instancedMesh ref={burstMeshRef} args={[undefined, undefined, 42]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial toneMapped={false} color="#ffffff" />
        </instancedMesh>
      </group>
    </group>
  );
};

interface InteractiveGiftsProps {
  openedIds: Record<string, number>;
  entered: boolean;
  isDay: boolean;
  onGiftClick: (gift: GiftBoxDef) => void;
}

export const InteractiveGifts: React.FC<InteractiveGiftsProps> = ({
  openedIds,
  entered,
  isDay,
  onGiftClick,
}) => {
  return (
    <group>
      {GIFT_DEFINITIONS.map((gift) => {
        const count = openedIds[gift.id] ?? 0;
        return (
          <SingleGiftBox
            key={gift.id}
            gift={gift}
            isOpened={count > 0}
            openCount={count}
            entered={entered}
            isDay={isDay}
            onSelect={onGiftClick}
          />
        );
      })}
    </group>
  );
};
