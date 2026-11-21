import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ChristmasTree } from './ChristmasTree';
import { InteractiveGifts } from './InteractiveGifts';
import { WinterEnvironment } from './WinterEnvironment';
import { SantaSleigh } from './SantaSleigh';
import { CuteSnowman } from './CuteSnowman';
import { Fireworks3D } from './Fireworks3D';
import {
  FireworkBurstEvent,
  GiftBoxDef,
  LightMode,
  SnowIntensity,
} from '../../types/wonderland';

interface WonderlandSceneProps {
  entered: boolean;
  treeLit: boolean;
  lightMode: LightMode;
  isDay: boolean;
  snowEnabled: boolean;
  snowIntensity: SnowIntensity;
  reducedMotion: boolean;
  waveNonce: number;
  starBurstNonce: number;
  surpriseNonce: number;
  openedGifts: Record<string, number>;
  fireworks: FireworkBurstEvent[];
  onTreeClick: (point: [number, number, number]) => void;
  onStarClick: () => void;
  onGiftClick: (gift: GiftBoxDef) => void;
  onSnowmanClick: () => void;
  onSantaFlyby: () => void;
}

// Error boundary around postprocessing so WebGL always renders gracefully
class PostProcessingBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// Cinematic Intro Crane-In + Smooth Mouse Parallax + Optional Horizontal Drag Orbit
const CameraRig: React.FC<{
  entered: boolean;
  reducedMotion: boolean;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  orbitAngleRef: React.MutableRefObject<number>;
}> = ({ entered, reducedMotion, pointerRef, orbitAngleRef }) => {
  const { camera, size } = useThree();
  const introProgressRef = useRef(0);
  const currentPosRef = useRef(new THREE.Vector3(0, 5.2, 16.5));
  const currentLookRef = useRef(new THREE.Vector3(0, 3.0, 0));

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const aspect = size.width / Math.max(1, size.height);

    // Responsive distance so desktop, tablet & portrait mobile all frame tree + gifts + snowman!
    const isPortrait = aspect < 0.85;
    const baseDist = isPortrait ? 13.4 : aspect < 1.25 ? 11.4 : 9.85;
    const baseHeight = isPortrait ? 3.45 : 3.25;
    const lookY = isPortrait ? 2.65 : 2.85;

    // Cinematic smooth entrance glide
    if (entered && introProgressRef.current < 1) {
      introProgressRef.current = Math.min(1, introProgressRef.current + dt * (reducedMotion ? 0.85 : 0.38));
    }
    const easeIntro = 1 - Math.pow(1 - introProgressRef.current, 3);

    const startDist = baseDist + 5.6;
    const startHeight = baseHeight + 2.0;

    const targetDist = THREE.MathUtils.lerp(startDist, baseDist, easeIntro);
    const targetHeight = THREE.MathUtils.lerp(startHeight, baseHeight, easeIntro);

    // Gentle parallax + smooth drag orbit
    const parallaxX = entered ? pointerRef.current.x * (reducedMotion ? 0.25 : 0.75) : Math.sin(t * 0.2) * 0.6;
    const parallaxY = entered ? pointerRef.current.y * (reducedMotion ? 0.12 : 0.42) : 0;

    const angle = orbitAngleRef.current + parallaxX * 0.12;
    const desiredX = Math.sin(angle) * targetDist;
    const desiredZ = Math.cos(angle) * targetDist;
    const desiredY = targetHeight + parallaxY + (reducedMotion ? 0 : Math.sin(t * 0.45) * 0.08);

    currentPosRef.current.lerp(new THREE.Vector3(desiredX, desiredY, desiredZ), dt * 3.4);
    currentLookRef.current.lerp(
      new THREE.Vector3(parallaxX * 0.18, lookY + parallaxY * 0.14, 0),
      dt * 3.4
    );

    camera.position.copy(currentPosRef.current);
    camera.lookAt(currentLookRef.current);
  });

  return null;
};

// Smoothly transitions atmospheric fog & scene lighting between Night and Day
const SceneAtmosphere: React.FC<{ isDay: boolean; entered: boolean }> = ({ isDay, entered }) => {
  const { scene } = useThree();
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const nightFog = useRef(new THREE.Color('#061124'));
  const dayFog = useRef(new THREE.Color('#c8dff2'));
  const curFog = useRef(new THREE.Color('#061124'));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const targetFog = isDay ? dayFog.current : nightFog.current;
    curFog.current.lerp(targetFog, dt * 1.8);

    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(curFog.current);
      scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, isDay ? 0.015 : 0.02, dt * 1.8);
    }

    const enterDim = entered ? 1.0 : 0.5;
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        (isDay ? 0.92 : 0.24) * enterDim,
        dt * 2
      );
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.lerp(
        hemiRef.current.intensity,
        (isDay ? 1.05 : 0.36) * enterDim,
        dt * 2
      );
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = THREE.MathUtils.lerp(
        keyLightRef.current.intensity,
        (isDay ? 2.15 : 0.68) * enterDim,
        dt * 2
      );
      keyLightRef.current.color.lerp(
        new THREE.Color(isDay ? '#fff2d8' : '#9ec2f7'),
        dt * 2
      );
    }
  });

  return (
    <>
      <fogExp2 attach="fog" args={['#061124', 0.02]} />
      <ambientLight ref={ambientRef} intensity={0.22} color="#b7d2f5" />
      <hemisphereLight
        ref={hemiRef}
        args={[isDay ? '#cce7ff' : '#355c99', isDay ? '#d8e6f5' : '#0c1c33', 0.42]}
      />
      <directionalLight
        ref={keyLightRef}
        position={[-9, 13, 8]}
        intensity={0.75}
        color="#bcd8ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={34}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      {/* Warm rim backlight for poetic silhouettes */}
      <directionalLight position={[8, 6, -10]} intensity={isDay ? 0.55 : 0.38} color="#ffd79e" />
    </>
  );
};

export const WonderlandScene: React.FC<WonderlandSceneProps> = ({
  entered,
  treeLit,
  lightMode,
  isDay,
  snowEnabled,
  snowIntensity,
  reducedMotion,
  waveNonce,
  starBurstNonce,
  surpriseNonce,
  openedGifts,
  fireworks,
  onTreeClick,
  onStarClick,
  onGiftClick,
  onSnowmanClick,
  onSantaFlyby,
}) => {
  const pointerRef = useRef({ x: 0, y: 0 });
  const orbitAngleRef = useRef(0);
  const dragStateRef = useRef({ active: false, lastX: 0 });

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointerRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);

      if (dragStateRef.current.active) {
        const dx = e.clientX - dragStateRef.current.lastX;
        dragStateRef.current.lastX = e.clientX;
        orbitAngleRef.current = THREE.MathUtils.clamp(
          orbitAngleRef.current - dx * 0.0045,
          -0.95,
          0.95
        );
      }
    };

    const onPointerUp = () => {
      dragStateRef.current.active = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 touch-none select-none"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).tagName === 'CANVAS') {
          dragStateRef.current.active = true;
          dragStateRef.current.lastX = e.clientX;
        }
      }}
    >
      <Canvas
        shadows
        dpr={reducedMotion ? [1, 1.25] : [1, 1.75]}
        camera={{ fov: 44, near: 0.1, far: 120, position: [0, 5.2, 16.5] }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
      >
        <SceneAtmosphere isDay={isDay} entered={entered} />

        <CameraRig
          entered={entered}
          reducedMotion={reducedMotion}
          pointerRef={pointerRef}
          orbitAngleRef={orbitAngleRef}
        />

        <WinterEnvironment
          isDay={isDay}
          snowEnabled={snowEnabled}
          snowIntensity={snowIntensity}
          reducedMotion={reducedMotion}
          entered={entered}
        />

        <ChristmasTree
          entered={entered}
          treeLit={treeLit}
          lightMode={lightMode}
          waveNonce={waveNonce}
          starBurstNonce={starBurstNonce}
          reducedMotion={reducedMotion}
          isDay={isDay}
          pointerRef={pointerRef}
          onTreeClick={onTreeClick}
          onStarClick={onStarClick}
        />

        <InteractiveGifts
          openedIds={openedGifts}
          entered={entered}
          isDay={isDay}
          onGiftClick={onGiftClick}
        />

        <CuteSnowman reducedMotion={reducedMotion} onSnowmanClick={onSnowmanClick} />

        <SantaSleigh
          entered={entered}
          surpriseNonce={surpriseNonce}
          reducedMotion={reducedMotion}
          onSantaFlyby={onSantaFlyby}
        />

        <Fireworks3D bursts={fireworks} reducedMotion={reducedMotion} />

        <PostProcessingBoundary>
          <EffectComposer multisampling={0}>
            <Bloom
              mipmapBlur
              luminanceThreshold={1.06}
              intensity={reducedMotion ? 0.45 : isDay ? 0.42 : 0.92}
              radius={0.68}
            />
          </EffectComposer>
        </PostProcessingBoundary>
      </Canvas>
    </div>
  );
};
