'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer } from '@react-three/drei';
import { Avatar } from './Avatar';
import { Robot } from './Robot';
import { useQuality } from '@/lib/useQuality';

/** Hero character — swap back to 'robot' in one line if a rigged GLB replaces the static avatar. */
const CHARACTER: 'avatar' | 'robot' = 'avatar';
/** The avatar's baked photoreal textures wash out under the robot's saturated rim lights — softer, more neutral tuning. */
const IS_AVATAR = CHARACTER === 'avatar';

/** Fixed full-viewport canvas behind the scrolling DOM content. */
export function Experience() {
  const quality = useQuality();

  // No usable WebGL / reduced-motion / Save-Data: intentional CSS backdrop, no Canvas.
  if (quality === 'static') {
    return <div className="canvas-root canvas-static" aria-hidden />;
  }

  const high = quality === 'high';

  return (
    <div className="canvas-root" aria-hidden>
      <Canvas
        shadows={high}
        dpr={high ? [1, 1.8] : [1, 1.3]}
        camera={{ position: [0, 0.4, 4.2], fov: 38 }}
        gl={{ antialias: high, powerPreference: high ? 'high-performance' : 'default' }}
      >
        <color attach="background" args={['#050508']} />
        <fog attach="fog" args={['#050508', 6, 14]} />
        {/* Without the HDR environment (dropped on mobile) the character needs more fill light. */}
        <ambientLight intensity={high ? (IS_AVATAR ? 0.4 : 0.25) : (IS_AVATAR ? 0.65 : 0.5)} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={IS_AVATAR ? 1.8 : 2.2}
          castShadow={high}
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-3, 1, 2]} intensity={IS_AVATAR ? 3 : 8} color="#00e5ff" distance={9} />
        {high && <pointLight position={[2, -1, -2]} intensity={IS_AVATAR ? 1.8 : 4} color="#3040ff" distance={8} />}
        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.25}>
            {CHARACTER === 'avatar' ? <Avatar /> : <Robot />}
          </Float>
          {/* Procedural IBL — no external HDR fetch (CSP-clean, self-contained).
              Baked once (frames={1}); brand-colored lightformers give the character
              premium reflections without a third-party CDN dependency. */}
          {high && (
            <Environment resolution={256} frames={1}>
              <Lightformer intensity={IS_AVATAR ? 1.8 : 2.2} position={[0, 2, 4]} scale={[8, 2, 1]} color="#ffffff" />
              <Lightformer intensity={IS_AVATAR ? 1.2 : 2} position={[-4, 1, 2]} scale={[4, 4, 1]} color="#00e5ff" />
              <Lightformer intensity={IS_AVATAR ? 0.9 : 1.5} position={[4, -1, -2]} scale={[4, 4, 1]} color="#3040ff" />
            </Environment>
          )}
        </Suspense>
        {high && (
          <ContactShadows position={[0, -1.05, 0]} opacity={0.55} scale={8} blur={2.6} far={3} />
        )}
      </Canvas>
    </div>
  );
}
