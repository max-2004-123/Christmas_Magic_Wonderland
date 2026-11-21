import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SnowIntensity } from '../../types/wonderland';

interface WinterEnvironmentProps {
  isDay: boolean;
  snowEnabled: boolean;
  snowIntensity: SnowIntensity;
  reducedMotion: boolean;
  entered: boolean;
}

function createSoftCircleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(240,248,255,0.55)');
  grad.addColorStop(1, 'rgba(240,248,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Cozy distant Christmas wooden cabin with glowing windows, wreath & curling chimney smoke
const ChristmasCabin: React.FC<{ isDay: boolean; reducedMotion: boolean }> = ({
  isDay,
  reducedMotion,
}) => {
  const smokeRef = useRef<THREE.InstancedMesh>(null);
  const cabinLightRef = useRef<THREE.PointLight>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const smokePuffs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        offset: i / 16,
        driftX: 0.25 + Math.random() * 0.3,
        driftZ: (Math.random() - 0.5) * 0.2,
        wobblePhase: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = reducedMotion ? 0.08 : 0.16;

    if (smokeRef.current) {
      for (let i = 0; i < smokePuffs.length; i++) {
        const p = smokePuffs[i];
        const cycle = (t * speed + p.offset) % 1;
        const y = 3.1 + cycle * 3.1;
        const x = 0.88 + cycle * 1.15 * p.driftX + Math.sin(t * 0.9 + p.wobblePhase) * 0.14 * cycle;
        const z = -0.35 + cycle * p.driftZ;
        const scale = (0.14 + cycle * 0.42) * Math.sin(cycle * Math.PI);

        dummy.position.set(x, y, z);
        dummy.scale.setScalar(Math.max(0.001, scale));
        dummy.updateMatrix();
        smokeRef.current.setMatrixAt(i, dummy.matrix);
      }
      smokeRef.current.instanceMatrix.needsUpdate = true;
    }

    if (cabinLightRef.current) {
      const flicker = 0.92 + 0.08 * Math.sin(t * 3.4) * Math.sin(t * 1.7);
      cabinLightRef.current.intensity = (isDay ? 1.4 : 4.6) * flicker;
    }
  });

  const windowGlow = isDay ? 1.1 : 2.35;

  return (
    <group position={[6.7, 0.22, -7.6]} rotation={[0, -0.58, 0]} scale={0.95}>
      {/* Snowy hill foundation under cabin */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[3.1, 4.2, 0.75, 24]} />
        <meshStandardMaterial color="#e6f0fc" roughness={0.88} />
      </mesh>

      {/* Stone Chimney */}
      <mesh position={[0.88, 2.35, -0.35]} castShadow>
        <boxGeometry args={[0.48, 1.55, 0.48]} />
        <meshStandardMaterial color="#676e7a" roughness={0.92} />
      </mesh>
      <mesh position={[0.88, 3.12, -0.35]}>
        <boxGeometry args={[0.58, 0.12, 0.58]} />
        <meshStandardMaterial color="#eef6ff" roughness={0.82} />
      </mesh>

      {/* Main Warm Timber Cabin Body */}
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.75, 1.85, 2.25]} />
        <meshStandardMaterial color="#593520" roughness={0.88} />
      </mesh>

      {/* Horizontal Log Trim Accent */}
      {[0.4, 0.85, 1.3, 1.75].map((y, idx) => (
        <mesh key={idx} position={[0, y, 1.14]}>
          <boxGeometry args={[2.82, 0.06, 0.04]} />
          <meshStandardMaterial color="#462816" roughness={0.9} />
        </mesh>
      ))}

      {/* Pitched Gable Roof + Thick Snow Blanket */}
      <group position={[0, 2.48, 0]}>
        <mesh rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2.42, 1.55, 4]} />
          <meshStandardMaterial color="#4a2819" roughness={0.85} />
        </mesh>
        {/* Snow cap resting atop roof */}
        <mesh position={[0, 0.1, 0]} rotation={[0, Math.PI / 4, 0]} receiveShadow>
          <coneGeometry args={[2.48, 1.48, 4]} />
          <meshStandardMaterial color="#f2f7ff" roughness={0.78} metalness={0.05} />
        </mesh>
      </group>

      {/* Cozy Wooden Front Door */}
      <mesh position={[0, 0.72, 1.14]}>
        <boxGeometry args={[0.58, 1.1, 0.06]} />
        <meshStandardMaterial color="#3c2012" roughness={0.85} />
      </mesh>
      {/* Festive Evergreen Wreath & Red Bow on Cabin Door */}
      <mesh position={[0, 0.86, 1.19]}>
        <torusGeometry args={[0.14, 0.04, 8, 16]} />
        <meshStandardMaterial color="#155736" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.72, 1.21]}>
        <boxGeometry args={[0.1, 0.05, 0.03]} />
        <meshStandardMaterial color="#d41e3a" roughness={0.4} />
      </mesh>

      {/* Warm Glowing Amber Multi-Pane Windows */}
      {[-0.82, 0.82].map((wx, idx) => (
        <group key={idx} position={[wx, 1.05, 1.14]}>
          <mesh>
            <boxGeometry args={[0.54, 0.54, 0.06]} />
            <meshStandardMaterial
              color="#ffe599"
              emissive="#ffae3d"
              emissiveIntensity={windowGlow}
              toneMapped={false}
            />
          </mesh>
          {/* Window mullions */}
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[0.56, 0.04, 0.02]} />
            <meshStandardMaterial color="#3c2112" />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[0.04, 0.56, 0.02]} />
            <meshStandardMaterial color="#3c2112" />
          </mesh>
          {/* Snow windowsill */}
          <mesh position={[0, -0.29, 0.05]}>
            <boxGeometry args={[0.62, 0.08, 0.14]} />
            <meshStandardMaterial color="#f2f7ff" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Side Warm Window */}
      <mesh position={[-1.39, 1.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[0.56, 0.54, 0.06]} />
        <meshStandardMaterial
          color="#ffe599"
          emissive="#ffae3d"
          emissiveIntensity={windowGlow * 0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Warm Porch Lantern Light spilling golden glow onto snow */}
      <pointLight
        ref={cabinLightRef}
        position={[0, 1.3, 1.9]}
        color="#ffb854"
        intensity={4.2}
        distance={9.5}
        decay={1.8}
      />

      {/* Curling Translucent White Chimney Smoke */}
      <instancedMesh ref={smokeRef} args={[undefined, undefined, smokePuffs.length]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial
          color="#e8f1ff"
          transparent
          opacity={0.32}
          roughness={1}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
};

// Occasional Shooting Stars streaking across the winter night sky
const ShootingStars: React.FC<{ isDay: boolean; reducedMotion: boolean }> = ({
  isDay,
  reducedMotion,
}) => {
  const star1Ref = useRef<THREE.Group>(null);
  const star2Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const animateMeteor = (
      group: THREE.Group | null,
      period: number,
      offset: number,
      startPos: [number, number, number],
      dir: [number, number, number]
    ) => {
      if (!group) return;
      if (isDay || reducedMotion) {
        group.visible = false;
        return;
      }
      const cycle = (t + offset) % period;
      const activeDur = 1.35;
      if (cycle < activeDur) {
        const u = cycle / activeDur;
        group.visible = true;
        group.position.set(
          startPos[0] + dir[0] * u,
          startPos[1] + dir[1] * u,
          startPos[2] + dir[2] * u
        );
        const fade = Math.sin(u * Math.PI);
        group.scale.set(fade, fade, fade);
      } else {
        group.visible = false;
      }
    };

    animateMeteor(star1Ref.current, 11.5, 2.0, [-18, 16.5, -24], [15, -6.5, 2]);
    animateMeteor(star2Ref.current, 16.0, 9.2, [16, 17.5, -26], [-16, -7.2, 2]);
  });

  return (
    <group>
      <group ref={star1Ref} rotation={[0, 0, -0.4]}>
        <mesh>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#fff9df" toneMapped={false} />
        </mesh>
        <mesh position={[-1.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.06, 2.7, 8]} />
          <meshBasicMaterial
            color="#d2ecff"
            transparent
            opacity={0.72}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group ref={star2Ref} rotation={[0, 0, 0.42]}>
        <mesh>
          <sphereGeometry args={[0.085, 8, 8]} />
          <meshBasicMaterial color="#ffe9ad" toneMapped={false} />
        </mesh>
        <mesh position={[1.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.055, 2.7, 8]} />
          <meshBasicMaterial
            color="#ffe5a3"
            transparent
            opacity={0.68}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};

export const WinterEnvironment: React.FC<WinterEnvironmentProps> = ({
  isDay,
  snowEnabled,
  snowIntensity,
  reducedMotion,
  entered,
}) => {
  const dayBlendRef = useRef(isDay ? 1 : 0);
  const forestTrunksRef = useRef<THREE.InstancedMesh>(null);
  const forestTier1Ref = useRef<THREE.InstancedMesh>(null);
  const forestTier2Ref = useRef<THREE.InstancedMesh>(null);
  const forestSnowRef = useRef<THREE.InstancedMesh>(null);
  const starsMatRef = useRef<THREE.ShaderMaterial>(null);
  const skyMatRef = useRef<THREE.ShaderMaterial>(null);
  const celestialRef = useRef<THREE.Group>(null);
  const moonHaloRef = useRef<THREE.Sprite>(null);
  const snow3DRef = useRef<THREE.Points>(null);

  const softCircleTex = useMemo(() => createSoftCircleTexture(), []);

  // Rolling snow terrain geometry (flat central courtyard, gentle winter hills outward)
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(78, 78, 72, 72);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.hypot(x, z);
      // Keep central radius 5.4 completely smooth and level for tree, gifts & snowman
      const hillMask = THREE.MathUtils.smoothstep(dist, 5.4, 18.0);
      const h =
        (Math.sin(x * 0.14) * Math.cos(z * 0.14) * 1.45 +
          Math.sin(x * 0.08 + z * 0.11) * 1.15 +
          0.95) *
        hillMask;
      // Gently rise rear horizon backdrop for alpine depth
      const backLift = z < -8 ? Math.min(3.4, (-z - 8) * 0.12) : 0;
      pos.setY(i, Math.max(0, h * 0.65 + backLift * hillMask));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Custom Sky Dome Shader with subtle Northern Lights aurora shimmer & Day/Night transition
  const skyMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uDayBlend: { value: 0 },
        },
        vertexShader: `
          varying vec3 vWorldPos;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uDayBlend;
          varying vec3 vWorldPos;

          void main() {
            vec3 dir = normalize(vWorldPos);
            float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
            float skyElev = clamp(dir.y, 0.0, 1.0);

            // Magical Deep Velvet Midnight Christmas Night
            vec3 nightHorizon = vec3(0.05, 0.11, 0.23);
            vec3 nightMid = vec3(0.018, 0.048, 0.135);
            vec3 nightZenith = vec3(0.006, 0.014, 0.052);
            vec3 nightCol = mix(nightHorizon, nightMid, smoothstep(0.0, 0.3, skyElev));
            nightCol = mix(nightCol, nightZenith, smoothstep(0.24, 0.82, skyElev));

            // Subtle dreamy aurora ribbon shimmering high in the night sky
            float auroraBand = smoothstep(0.14, 0.42, skyElev) * (1.0 - smoothstep(0.46, 0.78, skyElev));
            float wave1 = sin(dir.x * 5.2 + uTime * 0.25 + sin(dir.z * 3.0) * 1.4) * 0.5 + 0.5;
            float wave2 = sin(dir.x * 9.0 - uTime * 0.18 + dir.y * 6.0) * 0.5 + 0.5;
            float aurora = auroraBand * pow(wave1 * wave2, 1.75) * (1.0 - uDayBlend);
            vec3 auroraTint = mix(vec3(0.12, 0.62, 0.58), vec3(0.58, 0.42, 0.85), wave1);
            nightCol += auroraTint * aurora * 0.34;

            // Sparkling Nordic Winter Day Sky
            vec3 dayHorizon = vec3(0.95, 0.92, 0.89);
            vec3 dayMid = vec3(0.56, 0.78, 0.94);
            vec3 dayZenith = vec3(0.24, 0.50, 0.78);
            vec3 dayCol = mix(dayHorizon, dayMid, smoothstep(0.0, 0.3, skyElev));
            dayCol = mix(dayCol, dayZenith, smoothstep(0.25, 0.85, skyElev));

            vec3 finalCol = mix(nightCol, dayCol, uDayBlend);
            gl_FragColor = vec4(finalCol, 1.0);
          }
        `,
      }),
    []
  );

  // Starfield points & shader
  const { starPositions, starPhases, starSizes } = useMemo(() => {
    const count = 880;
    const pos = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.12 + Math.random() * 0.88); // Upper sky dome
      const r = 42 + Math.random() * 8;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 1.6 + Math.random() * 3.6;
    }
    return { starPositions: pos, starPhases: phases, starSizes: sizes };
  }, []);

  const starsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 1 },
        },
        vertexShader: `
          attribute float aPhase;
          attribute float aSize;
          uniform float uTime;
          varying float vTwinkle;
          void main() {
            vTwinkle = 0.5 + 0.5 * sin(uTime * 1.9 + aPhase);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (0.78 + vTwinkle * 0.45);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          varying float vTwinkle;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float core = pow(1.0 - d * 2.0, 2.2);
            vec3 col = mix(vec3(0.84, 0.92, 1.0), vec3(1.0, 0.94, 0.78), vTwinkle);
            gl_FragColor = vec4(col, core * uOpacity * (0.45 + vTwinkle * 0.55));
          }
        `,
      }),
    []
  );

  // Distant Snow-Covered Pine Forest placements (54 conifers framing the hills)
  const forestTrees = useMemo(() => {
    const trees: { x: number; y: number; z: number; scale: number; rotY: number }[] = [];
    for (let i = 0; i < 54; i++) {
      // Arrange in a natural scenic semicircle & distant wings (leaving front camera lane & cabin open)
      const angle = (i / 54) * Math.PI * 1.72 + Math.PI * 0.64;
      const radius = 10.8 + ((i * 7) % 13) * 0.95;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 2.5;

      // Avoid blocking cabin area [6.7, -7.6] or camera front view
      if (Math.hypot(x - 6.7, z + 7.6) < 4.2) continue;
      if (z > 4.5 && Math.abs(x) < 5.5) continue;

      const dist = Math.hypot(x, z);
      const hillMask = THREE.MathUtils.smoothstep(dist, 5.4, 18.0);
      const backLift = z < -8 ? Math.min(3.4, (-z - 8) * 0.12) : 0;
      const y = Math.max(0, 0.55 * hillMask + backLift * hillMask * 0.75);

      trees.push({
        x,
        y,
        z,
        scale: 0.78 + ((i * 13) % 10) * 0.1,
        rotY: i * 1.37,
      });
    }
    return trees;
  }, []);

  React.useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    forestTrees.forEach((tr, i) => {
      if (forestTrunksRef.current) {
        dummy.position.set(tr.x, tr.y + 0.45 * tr.scale, tr.z);
        dummy.rotation.set(0, tr.rotY, 0);
        dummy.scale.setScalar(tr.scale);
        dummy.updateMatrix();
        forestTrunksRef.current.setMatrixAt(i, dummy.matrix);
      }
      if (forestTier1Ref.current) {
        dummy.position.set(tr.x, tr.y + 1.45 * tr.scale, tr.z);
        dummy.rotation.set(0, tr.rotY, 0);
        dummy.scale.setScalar(tr.scale);
        dummy.updateMatrix();
        forestTier1Ref.current.setMatrixAt(i, dummy.matrix);
      }
      if (forestTier2Ref.current) {
        dummy.position.set(tr.x, tr.y + 2.45 * tr.scale, tr.z);
        dummy.rotation.set(0, tr.rotY + 0.5, 0);
        dummy.scale.setScalar(tr.scale);
        dummy.updateMatrix();
        forestTier2Ref.current.setMatrixAt(i, dummy.matrix);
      }
      if (forestSnowRef.current) {
        dummy.position.set(tr.x, tr.y + 2.9 * tr.scale, tr.z);
        dummy.rotation.set(0, tr.rotY + 0.5, 0);
        dummy.scale.setScalar(tr.scale * 1.03);
        dummy.updateMatrix();
        forestSnowRef.current.setMatrixAt(i, dummy.matrix);
      }
    });
    forestTrunksRef.current && (forestTrunksRef.current.instanceMatrix.needsUpdate = true);
    forestTier1Ref.current && (forestTier1Ref.current.instanceMatrix.needsUpdate = true);
    forestTier2Ref.current && (forestTier2Ref.current.instanceMatrix.needsUpdate = true);
    forestSnowRef.current && (forestSnowRef.current.instanceMatrix.needsUpdate = true);
  }, [forestTrees]);

  // 3D Depth Snow Particles around the tree (interleaving with 3D objects)
  const snow3DCount = 260;
  const snow3DData = useMemo(() => {
    const positions = new Float32Array(snow3DCount * 3);
    const speeds = new Float32Array(snow3DCount);
    const phases = new Float32Array(snow3DCount);
    for (let i = 0; i < snow3DCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = Math.random() * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      speeds[i] = 0.65 + Math.random() * 1.05;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, phases };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    dayBlendRef.current = THREE.MathUtils.lerp(dayBlendRef.current, isDay ? 1 : 0, dt * 1.8);
    const db = dayBlendRef.current;

    if (skyMatRef.current) {
      skyMatRef.current.uniforms.uTime.value = t;
      skyMatRef.current.uniforms.uDayBlend.value = db;
    }
    if (starsMatRef.current) {
      starsMatRef.current.uniforms.uTime.value = t;
      starsMatRef.current.uniforms.uOpacity.value = Math.max(0, 1 - db * 1.25);
    }

    if (moonHaloRef.current) {
      const mat = moonHaloRef.current.material as THREE.SpriteMaterial;
      mat.color.set(db > 0.5 ? '#fff1c2' : '#d6e8ff');
      const s = 6.2 + Math.sin(t * 0.9) * 0.25 + db * 2.4;
      moonHaloRef.current.scale.set(s, s, 1);
    }

    // Update 3D depth snow particles
    if (snow3DRef.current) {
      snow3DRef.current.visible = snowEnabled && entered;
      if (snowEnabled && entered) {
        const posAttr = snow3DRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
        const speedMul =
          (snowIntensity === 'blizzard' ? 2.4 : snowIntensity === 'heavy' ? 1.45 : 0.85) *
          (reducedMotion ? 0.45 : 1.0);
        const wind =
          (snowIntensity === 'blizzard' ? 2.1 : snowIntensity === 'heavy' ? 0.7 : 0.25) *
          (reducedMotion ? 0.35 : 1.0);

        for (let i = 0; i < snow3DCount; i++) {
          let x = posAttr.getX(i) + (Math.sin(t * 0.8 + snow3DData.phases[i]) * 0.35 + wind) * dt;
          let y = posAttr.getY(i) - snow3DData.speeds[i] * speedMul * dt;
          let z = posAttr.getZ(i) + Math.cos(t * 0.6 + snow3DData.phases[i]) * 0.2 * dt;

          if (y < 0.05) {
            y = 13.5 + Math.random() * 1.5;
            x = (Math.random() - 0.5) * 24;
            z = (Math.random() - 0.5) * 20;
          }
          if (x > 13) x = -13;
          if (x < -13) x = 13;

          posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Dynamic Night/Day Sky Dome with subtle Aurora */}
      <mesh>
        <sphereGeometry args={[58, 32, 24]} />
        <primitive object={skyMaterial} ref={skyMatRef} attach="material" />
      </mesh>

      {/* Twinkling Night Starfield */}
      <points material={starsMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aPhase"
            count={starPhases.length}
            array={starPhases}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aSize"
            count={starSizes.length}
            array={starSizes}
            itemSize={1}
          />
        </bufferGeometry>
      </points>

      {/* Glowing Moon (Night) / Winter Sun (Day) — cleanly framed in open sky */}
      <group ref={celestialRef} position={[-6.8, 11.4, -26]}>
        <mesh>
          <sphereGeometry args={[1.55, 24, 24]} />
          <meshBasicMaterial color={isDay ? '#fff3c4' : '#f4f8ff'} toneMapped={false} />
        </mesh>
        <sprite ref={moonHaloRef}>
          <spriteMaterial
            map={softCircleTex}
            color="#d8e9ff"
            transparent
            opacity={0.62}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      </group>

      {/* Occasional Shooting Stars */}
      <ShootingStars isDay={isDay} reducedMotion={reducedMotion} />

      {/* Soft Rolling Snow-Covered Ground */}
      <mesh geometry={terrainGeo} receiveShadow position={[0, -0.02, 0]}>
        <meshStandardMaterial
          color={isDay ? '#f4f8ff' : '#a8bede'}
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* Snow-Covered Distant Pine Forest */}
      <instancedMesh ref={forestTrunksRef} args={[undefined, undefined, forestTrees.length]}>
        <cylinderGeometry args={[0.14, 0.22, 1.0, 8]} />
        <meshStandardMaterial color="#3c2618" roughness={0.92} />
      </instancedMesh>
      <instancedMesh ref={forestTier1Ref} args={[undefined, undefined, forestTrees.length]} receiveShadow>
        <coneGeometry args={[1.18, 2.0, 10]} />
        <meshStandardMaterial color={isDay ? '#1b4f3a' : '#0c2c22'} roughness={0.88} />
      </instancedMesh>
      <instancedMesh ref={forestTier2Ref} args={[undefined, undefined, forestTrees.length]} receiveShadow>
        <coneGeometry args={[0.88, 1.7, 10]} />
        <meshStandardMaterial color={isDay ? '#225e46' : '#10382b'} roughness={0.86} />
      </instancedMesh>
      <instancedMesh ref={forestSnowRef} args={[undefined, undefined, forestTrees.length]}>
        <coneGeometry args={[0.62, 0.95, 10]} />
        <meshStandardMaterial color={isDay ? '#f7fbff' : '#d8e7fa'} roughness={0.78} />
      </instancedMesh>

      {/* Cozy Illuminated Wooden Christmas Cabin with Chimney Smoke */}
      <ChristmasCabin isDay={isDay} reducedMotion={reducedMotion} />

      {/* 3D Depth Snow Weaving Around the Tree */}
      <points ref={snow3DRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={snow3DCount}
            array={snow3DData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={softCircleTex}
          color="#ffffff"
          size={0.14}
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
