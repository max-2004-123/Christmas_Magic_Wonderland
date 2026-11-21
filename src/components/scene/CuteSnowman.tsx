import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';

interface CuteSnowmanProps {
  reducedMotion: boolean;
  onSnowmanClick: () => void;
}

export const CuteSnowman: React.FC<CuteSnowmanProps> = ({ reducedMotion, onSnowmanClick }) => {
  const rootRef = useRef<THREE.Group>(null);
  const hatRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const sparkleMeshRef = useRef<THREE.InstancedMesh>(null);

  const [hovered, setHovered] = useState(false);
  const cheerTimeRef = useRef(99);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        angle: (i / 24) * Math.PI * 2 + Math.random() * 0.25,
        speed: 0.7 + Math.random() * 1.2,
        lift: 1.4 + Math.random() * 1.4,
        color: new THREE.Color(i % 2 === 0 ? '#9ceeff' : '#ffe699'),
        size: 0.028 + Math.random() * 0.025,
      })),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const cheerDur = 1.6;

    if (cheerTimeRef.current < cheerDur) {
      cheerTimeRef.current += dt;
    }

    const ct = cheerTimeRef.current;
    const isCheering = ct < cheerDur;
    const prog = Math.min(1, ct / cheerDur);

    // Body hop & cheerful squash/stretch
    if (rootRef.current) {
      let jumpY = 0;
      let scaleY = 1;
      let scaleXZ = 1;
      let swayZ = reducedMotion ? 0 : Math.sin(t * 1.35) * 0.028;

      if (isCheering) {
        const bounce = Math.abs(Math.sin(prog * Math.PI * 2));
        jumpY = bounce * (1 - prog * 0.4) * 0.45;
        scaleY = 1 + (bounce - 0.3) * 0.16 * (1 - prog);
        scaleXZ = 1 / Math.sqrt(scaleY);
        swayZ = Math.sin(prog * Math.PI * 4) * 0.12 * (1 - prog);
      } else if (hovered) {
        jumpY = 0.04 + Math.sin(t * 5) * 0.02;
      }

      rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, jumpY, dt * 14);
      rootRef.current.scale.set(
        THREE.MathUtils.lerp(rootRef.current.scale.x, scaleXZ, dt * 14),
        THREE.MathUtils.lerp(rootRef.current.scale.y, scaleY, dt * 14),
        THREE.MathUtils.lerp(rootRef.current.scale.z, scaleXZ, dt * 14)
      );
      rootRef.current.rotation.z = THREE.MathUtils.lerp(rootRef.current.rotation.z, swayZ, dt * 12);
    }

    // Top hat joyful tip & lift
    if (hatRef.current) {
      const lift = isCheering ? Math.sin(prog * Math.PI) * 0.26 : hovered ? 0.04 : 0;
      const tilt = isCheering ? Math.sin(prog * Math.PI * 2) * 0.25 : 0.08;
      hatRef.current.position.y = THREE.MathUtils.lerp(hatRef.current.position.y, 0.24 + lift, dt * 12);
      hatRef.current.rotation.z = THREE.MathUtils.lerp(hatRef.current.rotation.z, tilt, dt * 12);
    }

    // Twig arms waving happily
    if (leftArmRef.current && rightArmRef.current) {
      const wave = isCheering
        ? Math.sin(prog * Math.PI * 7) * 0.55
        : hovered
          ? Math.sin(t * 7) * 0.22
          : Math.sin(t * 1.4) * 0.04;
      leftArmRef.current.rotation.z = 0.55 + wave;
      rightArmRef.current.rotation.z = -0.55 - wave;
    }

    // Subtle head look
    if (headRef.current) {
      const nod = isCheering ? Math.sin(prog * Math.PI * 3) * 0.14 : 0;
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, nod, dt * 10);
    }

    // Sparkle snow burst on click
    if (sparkleMeshRef.current) {
      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i];
        if (!isCheering) {
          dummy.position.set(0, -10, 0);
          dummy.scale.setScalar(0.0001);
          dummy.updateMatrix();
          sparkleMeshRef.current.setMatrixAt(i, dummy.matrix);
          continue;
        }
        const r = ct * s.speed;
        const y = 1.2 + ct * s.lift - ct * ct * 1.3;
        const fade = Math.max(0, 1 - prog);
        dummy.position.set(Math.cos(s.angle) * r, y, Math.sin(s.angle) * r);
        dummy.rotation.set(ct * 4, ct * 5, ct * 3);
        dummy.scale.setScalar(s.size * fade * 1.5);
        dummy.updateMatrix();
        sparkleMeshRef.current.setMatrixAt(i, dummy.matrix);
        sparkleMeshRef.current.setColorAt(i, s.color);
      }
      sparkleMeshRef.current.instanceMatrix.needsUpdate = true;
      if (sparkleMeshRef.current.instanceColor) {
        sparkleMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    cheerTimeRef.current = 0;
    onSnowmanClick();
  };

  return (
    <group position={[-3.75, 0, 0.55]} rotation={[0, 0.56, 0]}>
      {/* Ground snow mound cushion */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.68, 0.85, 0.12, 20]} />
        <meshStandardMaterial color="#eef5ff" roughness={0.85} />
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
        {/* Bottom Snowball */}
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.46, 22, 18]} />
          <meshStandardMaterial color="#f5f9ff" roughness={0.78} metalness={0.04} />
        </mesh>

        {/* Middle Torso Snowball */}
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.35, 22, 18]} />
          <meshStandardMaterial color="#f7fbff" roughness={0.76} metalness={0.04} />
        </mesh>

        {/* Coal Buttons */}
        {[1.1, 0.96, 0.82].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0.33 - idx * 0.015]}>
            <sphereGeometry args={[0.032, 10, 10]} />
            <meshStandardMaterial color="#1d2229" roughness={0.65} />
          </mesh>
        ))}

        {/* Cozy Knitted Red Scarf */}
        <mesh position={[0, 1.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.255, 0.062, 12, 24]} />
          <meshStandardMaterial color="#c91f3b" roughness={0.85} />
        </mesh>
        {/* Scarf hanging tail */}
        <mesh position={[0.16, 1.08, 0.22]} rotation={[0.12, 0.2, -0.18]} castShadow>
          <boxGeometry args={[0.11, 0.36, 0.045]} />
          <meshStandardMaterial color="#c91f3b" roughness={0.85} />
        </mesh>
        {/* Gold scarf trim stripe */}
        <mesh position={[0.18, 0.94, 0.24]} rotation={[0.12, 0.2, -0.18]}>
          <boxGeometry args={[0.115, 0.04, 0.05]} />
          <meshStandardMaterial color="#f5d07b" roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Left & Right Twig Arms */}
        <group ref={leftArmRef} position={[-0.31, 1.08, 0.02]}>
          <mesh position={[-0.22, 0.08, 0]} rotation={[0, 0, 1.25]} castShadow>
            <cylinderGeometry args={[0.018, 0.026, 0.5, 8]} />
            <meshStandardMaterial color="#593722" roughness={0.92} />
          </mesh>
          <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, 0.65]}>
            <cylinderGeometry args={[0.01, 0.015, 0.16, 6]} />
            <meshStandardMaterial color="#593722" roughness={0.92} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.31, 1.08, 0.02]}>
          <mesh position={[0.22, 0.08, 0]} rotation={[0, 0, -1.25]} castShadow>
            <cylinderGeometry args={[0.018, 0.026, 0.5, 8]} />
            <meshStandardMaterial color="#593722" roughness={0.92} />
          </mesh>
          <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, -0.65]}>
            <cylinderGeometry args={[0.01, 0.015, 0.16, 6]} />
            <meshStandardMaterial color="#593722" roughness={0.92} />
          </mesh>
        </group>

        {/* Snowman Head */}
        <group ref={headRef} position={[0, 1.48, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.26, 22, 18]} />
            <meshStandardMaterial color="#ffffff" roughness={0.74} />
          </mesh>

          {/* Coal Eyes */}
          <mesh position={[-0.09, 0.06, 0.225]}>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshStandardMaterial color="#14181f" roughness={0.35} />
          </mesh>
          <mesh position={[0.09, 0.06, 0.225]}>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshStandardMaterial color="#14181f" roughness={0.35} />
          </mesh>

          {/* Cute Rosy Cheeks */}
          <mesh position={[-0.145, -0.01, 0.2]}>
            <sphereGeometry args={[0.032, 10, 10]} />
            <meshStandardMaterial color="#ff8ea4" roughness={0.7} emissive="#ff6b8b" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0.145, -0.01, 0.2]}>
            <sphereGeometry args={[0.032, 10, 10]} />
            <meshStandardMaterial color="#ff8ea4" roughness={0.7} emissive="#ff6b8b" emissiveIntensity={0.2} />
          </mesh>

          {/* Carrot Nose */}
          <mesh position={[0, 0.0, 0.31]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <coneGeometry args={[0.04, 0.22, 12]} />
            <meshStandardMaterial color="#f27321" roughness={0.58} />
          </mesh>

          {/* Smiling Coal Dots */}
          {[-0.08, -0.04, 0, 0.04, 0.08].map((x, idx) => (
            <mesh key={idx} position={[x, -0.085 + Math.abs(x) * 0.28, 0.235 - Math.abs(x) * 0.15]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshStandardMaterial color="#181d24" roughness={0.6} />
            </mesh>
          ))}

          {/* Classic Top Hat with Crimson Ribbon & Holly */}
          <group ref={hatRef} position={[0, 0.24, 0]} rotation={[0, 0, 0.08]}>
            {/* Brim */}
            <mesh castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.035, 22]} />
              <meshStandardMaterial color="#1a202c" roughness={0.72} />
            </mesh>
            {/* Crown */}
            <mesh position={[0, 0.17, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.19, 0.32, 22]} />
              <meshStandardMaterial color="#181e29" roughness={0.75} />
            </mesh>
            {/* Crimson Hat Band */}
            <mesh position={[0, 0.055, 0]}>
              <cylinderGeometry args={[0.198, 0.198, 0.065, 22]} />
              <meshStandardMaterial color="#c91f3b" roughness={0.45} />
            </mesh>
            {/* Tiny Holly Berries & Leaf */}
            <mesh position={[0.16, 0.075, 0.12]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#ff2a4d" emissive="#800c1f" emissiveIntensity={0.35} />
            </mesh>
            <mesh position={[0.19, 0.065, 0.095]} rotation={[0.3, 0.4, 0.5]}>
              <boxGeometry args={[0.06, 0.028, 0.01]} />
              <meshStandardMaterial color="#1c6e42" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* Snow Sparkle Celebration Particles */}
        <instancedMesh ref={sparkleMeshRef} args={[undefined, undefined, sparkles.length]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial toneMapped={false} color="#ffffff" />
        </instancedMesh>
      </group>
    </group>
  );
};
