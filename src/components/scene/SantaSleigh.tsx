import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface SantaSleighProps {
  entered: boolean;
  surpriseNonce: number;
  reducedMotion: boolean;
  onSantaFlyby?: () => void;
}

const ReindeerModel: React.FC<{ isRudolph?: boolean; offsetZ: number; offsetX: number; gallopPhase: number }> = ({
  isRudolph,
  offsetZ,
  offsetX,
  gallopPhase,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const frontLegRef = useRef<THREE.Mesh>(null);
  const backLegRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 7.5 + gallopPhase;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t) * 0.07;
      groupRef.current.rotation.x = Math.cos(t) * 0.08;
    }
    if (frontLegRef.current) frontLegRef.current.rotation.x = Math.sin(t) * 0.6;
    if (backLegRef.current) backLegRef.current.rotation.x = -Math.sin(t) * 0.6;
  });

  return (
    <group ref={groupRef} position={[offsetX, 0, offsetZ]}>
      {/* Torso */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.11, 0.34, 6, 10]} />
        <meshStandardMaterial color="#7a4c2a" roughness={0.75} />
      </mesh>
      {/* Neck & Head */}
      <mesh position={[0, 0.16, 0.22]} rotation={[0.45, 0, 0]}>
        <capsuleGeometry args={[0.06, 0.16, 4, 8]} />
        <meshStandardMaterial color="#7a4c2a" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.25, 0.31]}>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshStandardMaterial color="#875530" roughness={0.75} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.23, 0.39]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.036, 0.055, 0.1, 8]} />
        <meshStandardMaterial color="#9e6c44" roughness={0.75} />
      </mesh>
      {/* Rudolph's Glowing Ruby-Red Nose! */}
      {isRudolph && (
        <mesh position={[0, 0.235, 0.455]}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshBasicMaterial color="#ff2a3c" toneMapped={false} />
        </mesh>
      )}
      {/* Branched Golden Antlers */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.055, 0.33, 0.29]} rotation={[0.15, 0, -side * 0.35]}>
          <mesh>
            <cylinderGeometry args={[0.009, 0.013, 0.2, 6]} />
            <meshStandardMaterial color="#d8bc94" roughness={0.6} />
          </mesh>
          <mesh position={[side * 0.04, 0.04, 0.02]} rotation={[0.2, 0, -side * 0.6]}>
            <cylinderGeometry args={[0.007, 0.009, 0.1, 6]} />
            <meshStandardMaterial color="#d8bc94" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Golden Harness Collar */}
      <mesh position={[0, 0.08, 0.17]} rotation={[0.35, 0, 0]}>
        <torusGeometry args={[0.11, 0.018, 6, 12]} />
        <meshStandardMaterial color="#f5cc66" metalness={0.85} roughness={0.2} emissive="#7d5812" emissiveIntensity={0.4} />
      </mesh>
      {/* Animated Galloping Legs */}
      <mesh ref={frontLegRef} position={[0, -0.17, 0.14]}>
        <boxGeometry args={[0.11, 0.24, 0.045]} />
        <meshStandardMaterial color="#59351c" roughness={0.8} />
      </mesh>
      <mesh ref={backLegRef} position={[0, -0.17, -0.14]}>
        <boxGeometry args={[0.11, 0.24, 0.045]} />
        <meshStandardMaterial color="#59351c" roughness={0.8} />
      </mesh>
    </group>
  );
};

export const SantaSleigh: React.FC<SantaSleighProps> = ({
  entered,
  surpriseNonce,
  reducedMotion,
  onSantaFlyby,
}) => {
  const sleighGroupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.InstancedMesh>(null);

  const flightProgressRef = useRef(-1); // -1 = waiting between flybys
  const cooldownRef = useRef(8.5); // First enchanting flyby ~8.5s after entering!
  const lastSurpriseNonceRef = useRef(surpriseNonce);
  const trailPositionsRef = useRef<THREE.Vector3[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const trailCount = 55;

  useMemo(() => {
    trailPositionsRef.current = Array.from({ length: trailCount }, () => new THREE.Vector3(0, -100, 0));
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!entered) return;

    // Immediately summon Santa on Christmas Surprise!
    if (surpriseNonce !== lastSurpriseNonceRef.current) {
      lastSurpriseNonceRef.current = surpriseNonce;
      flightProgressRef.current = 0;
      cooldownRef.current = 24;
    }

    if (flightProgressRef.current < 0) {
      cooldownRef.current -= dt;
      if (cooldownRef.current <= 0) {
        flightProgressRef.current = 0;
        cooldownRef.current = 26 + Math.random() * 10;
        onSantaFlyby?.();
      }
    }

    const active = flightProgressRef.current >= 0;
    if (sleighGroupRef.current) {
      sleighGroupRef.current.visible = active;
    }

    if (active && sleighGroupRef.current) {
      const speed = reducedMotion ? 0.055 : 0.072;
      flightProgressRef.current += dt * speed;
      const u = flightProgressRef.current;

      if (u >= 1) {
        flightProgressRef.current = -1;
        sleighGroupRef.current.visible = false;
      } else {
        // Graceful high moonlit arc from back-left across the starry night toward front-right
        const x = THREE.MathUtils.lerp(-20, 20, u);
        const y = 6.2 + Math.sin(u * Math.PI) * 3.1 + Math.sin(u * Math.PI * 5) * 0.22;
        const z = -9.5 + Math.sin(u * Math.PI) * 3.8;

        const nextU = Math.min(1, u + 0.01);
        const nx = THREE.MathUtils.lerp(-20, 20, nextU);
        const ny = 6.2 + Math.sin(nextU * Math.PI) * 3.1 + Math.sin(nextU * Math.PI * 5) * 0.22;
        const nz = -9.5 + Math.sin(nextU * Math.PI) * 3.8;

        sleighGroupRef.current.position.set(x, y, z);
        sleighGroupRef.current.lookAt(nx, ny, nz);

        // Push shimmering stardust trail
        trailPositionsRef.current.pop();
        trailPositionsRef.current.unshift(
          new THREE.Vector3(
            x + (Math.random() - 0.5) * 0.28,
            y + (Math.random() - 0.5) * 0.22,
            z + (Math.random() - 0.5) * 0.28
          )
        );
      }
    } else {
      // Fade trail away smoothly when Santa finishes his pass
      trailPositionsRef.current.pop();
      trailPositionsRef.current.unshift(new THREE.Vector3(0, -100, 0));
    }

    // Update golden stardust trail instances
    if (trailRef.current) {
      for (let i = 0; i < trailCount; i++) {
        const pt = trailPositionsRef.current[i];
        const fade = 1 - i / trailCount;
        if (pt.y < -50) {
          dummy.position.set(0, -100, 0);
          dummy.scale.setScalar(0.0001);
        } else {
          dummy.position.set(
            pt.x,
            pt.y - (i * 0.015),
            pt.z
          );
          dummy.rotation.set(state.clock.elapsedTime * 2 + i, i, 0);
          dummy.scale.setScalar(0.065 * fade * (0.7 + 0.3 * Math.sin(state.clock.elapsedTime * 8 + i)));
        }
        dummy.updateMatrix();
        trailRef.current.setMatrixAt(i, dummy.matrix);
      }
      trailRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <group ref={sleighGroupRef} visible={false} scale={0.95}>
        {/* Sleigh Body (Crimson & Gold) */}
        <group position={[0, 0, -0.5]}>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.62, 0.34, 1.05]} />
            <meshStandardMaterial color="#c41e3a" roughness={0.35} metalness={0.28} emissive="#4d0914" emissiveIntensity={0.4} />
          </mesh>
          {/* Curved Golden Trim */}
          <mesh position={[0, 0.23, 0]}>
            <boxGeometry args={[0.66, 0.05, 1.09]} />
            <meshStandardMaterial color="#f5cc66" metalness={0.88} roughness={0.2} emissive="#7d5812" emissiveIntensity={0.4} />
          </mesh>
          {/* Twin Golden Sleigh Runners */}
          {[-0.27, 0.27].map((rx, idx) => (
            <mesh key={idx} position={[rx, -0.18, 0.08]}>
              <boxGeometry args={[0.045, 0.045, 1.38]} />
              <meshStandardMaterial color="#f5d07b" metalness={0.9} roughness={0.18} emissive="#7a520e" emissiveIntensity={0.35} />
            </mesh>
          ))}
          {/* Overflowing Gift Sack */}
          <mesh position={[0, 0.34, -0.28]}>
            <sphereGeometry args={[0.28, 12, 12]} />
            <meshStandardMaterial color="#8c192d" roughness={0.8} />
          </mesh>
          {/* Santa Claus Figure */}
          <group position={[0, 0.36, 0.16]}>
            {/* Red Coat */}
            <mesh>
              <cylinderGeometry args={[0.14, 0.2, 0.32, 12]} />
              <meshStandardMaterial color="#d9243d" roughness={0.65} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.24, 0]}>
              <sphereGeometry args={[0.11, 12, 12]} />
              <meshStandardMaterial color="#f7ccb0" roughness={0.7} />
            </mesh>
            {/* Fluffy White Beard */}
            <mesh position={[0, 0.18, 0.08]}>
              <sphereGeometry args={[0.095, 10, 10]} />
              <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
            {/* Santa Hat */}
            <mesh position={[0, 0.36, -0.02]} rotation={[-0.25, 0, 0]}>
              <coneGeometry args={[0.105, 0.24, 12]} />
              <meshStandardMaterial color="#d9243d" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.47, -0.08]}>
              <sphereGeometry args={[0.042, 8, 8]} />
              <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
          </group>
          {/* Glowing Front Golden Lantern */}
          <mesh position={[0, 0.22, 0.56]}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshBasicMaterial color="#ffe494" toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0.3, 0.6]} color="#ffd570" intensity={3.2} distance={8} />
        </group>

        {/* Golden Reins connecting sleigh to reindeer team */}
        {[-0.22, 0.22].map((rx, idx) => (
          <mesh key={idx} position={[rx, 0.12, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 2.75, 6]} />
            <meshBasicMaterial color="#f5d07b" />
          </mesh>
        ))}

        {/* Reindeer Team (2 pairs + glowing-nose Rudolph leading!) */}
        <ReindeerModel offsetX={-0.25} offsetZ={1.25} gallopPhase={0} />
        <ReindeerModel offsetX={0.25} offsetZ={1.25} gallopPhase={0.9} />
        <ReindeerModel offsetX={-0.25} offsetZ={2.25} gallopPhase={1.8} />
        <ReindeerModel offsetX={0.25} offsetZ={2.25} gallopPhase={2.7} />
        <ReindeerModel isRudolph offsetX={0} offsetZ={3.15} gallopPhase={3.6} />
      </group>

      {/* Shimmering Golden Stardust Trail */}
      <instancedMesh ref={trailRef} args={[undefined, undefined, trailCount]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#ffe48f" toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
