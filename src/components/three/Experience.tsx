'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Float } from '@react-three/drei';
import { Robot } from './Robot';
import { useQuality } from '@/lib/useQuality';

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
        {/* Without the HDR environment (dropped on mobile) the robot needs more fill light. */}
        <ambientLight intensity={high ? 0.25 : 0.5} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={2.2}
          castShadow={high}
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-3, 1, 2]} intensity={8} color="#00e5ff" distance={9} />
        {high && <pointLight position={[2, -1, -2]} intensity={4} color="#3040ff" distance={8} />}
        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.25}>
            <Robot />
          </Float>
          {high && <Environment preset="city" />}
        </Suspense>
        {high && (
          <ContactShadows position={[0, -1.05, 0]} opacity={0.55} scale={8} blur={2.6} far={3} />
        )}
      </Canvas>
    </div>
  );
}
