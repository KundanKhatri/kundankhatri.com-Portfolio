'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer } from '@react-three/drei';
import { Avatar } from './Avatar';
import { Robot } from './Robot';
import { useQuality } from '@/lib/useQuality';

/** Hero character — switch to 'robot' for the rigged, animated Kundan (walking, waving, talking). */
const CHARACTER = 'robot' as 'avatar' | 'robot';
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
        <color attach="background" args={['#0a0a0c']} />
        <fog attach="fog" args={['#0a0a0c', 6, 14]} />
        {/* Dark-luxury lighting: warm key + soft fill, no neon. Avatars get a touch more ambient. */}
        <ambientLight intensity={high ? (IS_AVATAR ? 0.4 : 0.35) : (IS_AVATAR ? 0.65 : 0.55)} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={IS_AVATAR ? 1.8 : 2.4}
          castShadow={high}
          shadow-mapSize={[1024, 1024]}
        />
        {/* Warm gold rim — the luxury accent */}
        <pointLight position={[-3, 1.5, 2]} intensity={IS_AVATAR ? 3 : 5} color="#d4af37" distance={9} />
        {high && <pointLight position={[2, -1, -2]} intensity={IS_AVATAR ? 1.8 : 2.5} color="#f2e6c2" distance={8} />}
        <Suspense fallback={null}>
          <Float speed={1.0} rotationIntensity={0.04} floatIntensity={0.2}>
            {CHARACTER === 'avatar' ? <Avatar /> : <Robot />}
          </Float>
          {/* Procedural IBL — warm-neutral lightformers for premium reflections. */}
          {high && (
            <Environment resolution={256} frames={1}>
              <Lightformer intensity={2.2} position={[0, 2, 4]} scale={[8, 2, 1]} color="#fff8e7" />
              <Lightformer intensity={1.4} position={[-4, 1, 2]} scale={[4, 4, 1]} color="#d4af37" />
              <Lightformer intensity={1.0} position={[4, -1, -2]} scale={[4, 4, 1]} color="#f2e6c2" />
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
