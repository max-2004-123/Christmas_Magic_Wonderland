import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FireworkBurstEvent } from '../../types/wonderland';

interface Fireworks3DProps {
  bursts: FireworkBurstEvent[];
  reducedMotion: boolean;
}

interface Spark {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  age: number;
  life: number;
  size: number;
}

const MAX_SPARKS = 520;

export const Fireworks3D: React.FC<Fireworks3DProps> = ({ bursts, reducedMotion }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const sparksRef = useRef<Spark[]>([]);
  const processedIdsRef = useRef<Set<number>>(new Set());
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratchColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    bursts.forEach((b) => {
      if (processedIdsRef.current.has(b.id)) return;
      processedIdsRef.current.add(b.id);

      const count = reducedMotion ? 36 : 82;
      const origin = new THREE.Vector3(...b.origin);

      for (let i = 0; i < count; i++) {
        // Uniform spherical firework shell distribution
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const speed = (2.1 + Math.random() * 2.9) * b.scale;

        const vx = Math.sin(phi) * Math.cos(theta) * speed;
        const vy = Math.cos(phi) * speed + 0.7;
        const vz = Math.sin(phi) * Math.sin(theta) * speed;

        const hex = b.palette[i % b.palette.length];
        sparksRef.current.push({
          pos: origin.clone(),
          vel: new THREE.Vector3(vx, vy, vz),
          color: new THREE.Color(hex),
          age: 0,
          life: 1.35 + Math.random() * 0.95,
          size: (0.042 + Math.random() * 0.045) * b.scale,
        });
      }

      if (sparksRef.current.length > MAX_SPARKS) {
        sparksRef.current = sparksRef.current.slice(-MAX_SPARKS);
      }
    });
  }, [bursts, reducedMotion]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const sparks = sparksRef.current;

    let writeIdx = 0;
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      s.age += dt;
      if (s.age >= s.life) continue;

      s.vel.y -= 2.35 * dt; // Soft gravity arc
      s.vel.multiplyScalar(1 - 1.15 * dt); // Silky firework drag
      s.pos.addScaledVector(s.vel, dt);

      const lifeFrac = 1 - s.age / s.life;
      const twinkle = 0.65 + 0.35 * Math.sin(t * 24 + i * 1.7);

      dummy.position.copy(s.pos);
      dummy.rotation.set(s.age * 4, s.age * 3, 0);
      dummy.scale.setScalar(s.size * lifeFrac * (0.85 + twinkle * 0.45));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(writeIdx, dummy.matrix);

      scratchColor.copy(s.color).multiplyScalar(1.6 + lifeFrac * 1.8 * twinkle);
      meshRef.current.setColorAt(writeIdx, scratchColor);

      sparks[writeIdx] = s;
      writeIdx++;
    }
    sparks.length = writeIdx;

    // Hide unused instances cleanly
    for (let i = writeIdx; i < MAX_SPARKS; i++) {
      dummy.position.set(0, -100, 0);
      dummy.scale.setScalar(0.0001);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_SPARKS]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial toneMapped={false} color="#ffffff" />
    </instancedMesh>
  );
};
