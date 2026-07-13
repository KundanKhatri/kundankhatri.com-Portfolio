'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { damp, damp3, dampAngle } from 'maath/easing';
import { scrollState } from '@/lib/useScrollProgress';
import { sound } from '@/lib/sound';

const BASE = '/models/kundan-avatar.glb';

/** Meshy export has arbitrary scale/pivot — normalized at runtime to this world-space height. */
const TARGET_HEIGHT = 1.8;
/** Fixed yaw correction if the export doesn't face +Z after normalization. */
const ROTATION_OFFSET_Y = 0;
/** Fixed nudge applied after centering, for hand-tuning against the camera/lighting rig. */
const POSITION_OFFSET = new THREE.Vector3(0, 0, 0);

const IDLE_BOB_SPEED = 0.6; // rad/s, slow vertical breathing motion
const IDLE_BOB_AMOUNT = 0.02; // fraction of TARGET_HEIGHT
const IDLE_SWAY_SPEED = 0.15; // rad/s, even slower than the bob
const IDLE_SWAY_AMOUNT = 0.05; // rad
const CURSOR_YAW_CLAMP = 0.45; // rad
const CURSOR_TILT_CLAMP = 0.12; // rad
const DRIFT_X_FACTOR = 0.22; // matches Robot.tsx's S-curve drift width
const CLICK_PULSE_AMOUNT = 0.06;
const CLICK_PULSE_DURATION = 0.5; // seconds

// Speech-driven life: the avatar becomes more alert while Digital Kundan talks.
const SPEAK_EMPHASIS_SPEED = 8; // rad/s
const SPEAK_EMPHASIS_AMOUNT = 0.018; // fraction of TARGET_HEIGHT
const SPEAK_NOD_SPEED = 5.5; // rad/s
const SPEAK_NOD_AMOUNT = 0.035; // rad
const SPEAK_LOOK_INTENSITY = 1.6; // cursor influence multiplier while speaking

type Pose = { xNorm: number; y: number; z: number; rotationY: number; scale: number };

/** One pose per scroll section — index mirrors Robot.tsx's SECTION_CLIP
 *  (hero, then content.ts chapters: origin, operations, santosh, zerotheory, security, then closing). */
const SECTION_POSES: Pose[] = [
  { xNorm: 0, y: -0.95, z: 0, rotationY: 0, scale: 1 }, // hero — centered, facing forward
  { xNorm: -0.5, y: -0.9, z: 0.15, rotationY: -0.4, scale: 1.02 }, // origin — steps left, turns to greet
  { xNorm: 0.55, y: -0.98, z: -0.2, rotationY: 0.55, scale: 0.95 }, // operations — steps right, recedes into the work
  { xNorm: -0.4, y: -0.85, z: 0.2, rotationY: -0.5, scale: 1.08 }, // santosh — leans in close, presenting
  { xNorm: 0.3, y: -0.9, z: -0.1, rotationY: 0.3, scale: 1.1 }, // zerotheory — most prominent, confident
  { xNorm: -0.2, y: -0.92, z: 0.05, rotationY: -0.25, scale: 1.03 }, // security — steady, watchful stance
  { xNorm: 0, y: -0.95, z: 0, rotationY: 0, scale: 0.97 }, // closing — settles back to center
];

export function Avatar() {
  const group = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { scene } = useGLTF(BASE);
  const scaleState = useRef({ base: 1 });
  const pulseElapsed = useRef<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const { viewport, pointer } = useThree();

  // Listen to the TTS state broadcast by voice.ts so the avatar can animate while talking.
  useEffect(() => {
    const onSpeak = (e: Event) => {
      setSpeaking((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener('kk-speaking', onSpeak);
    return () => window.removeEventListener('kk-speaking', onSpeak);
  }, []);

  // Normalize the static mesh once: center it, sit it on the ground plane, scale to TARGET_HEIGHT.
  useEffect(() => {
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);

    const rawBox = new THREE.Box3().setFromObject(scene);
    const rawHeight = rawBox.max.y - rawBox.min.y;
    scene.scale.setScalar(TARGET_HEIGHT / (rawHeight || 1));

    const scaledBox = new THREE.Box3().setFromObject(scene);
    const center = scaledBox.getCenter(new THREE.Vector3());
    scene.position.set(-center.x, -scaledBox.min.y, -center.z);
    scene.position.add(POSITION_OFFSET);
    scene.rotation.y = ROTATION_OFFSET_Y;

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.frustumCulled = false;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const sec = Math.min(scrollState.section, SECTION_POSES.length - 1);
    const pose = SECTION_POSES[sec];
    const t = state.clock.elapsedTime;

    // Idle life: gentle bob + very slow sway, layered under the chapter pose.
    let bob = Math.sin(t * IDLE_BOB_SPEED) * TARGET_HEIGHT * IDLE_BOB_AMOUNT;
    let sway = Math.sin(t * IDLE_SWAY_SPEED) * IDLE_SWAY_AMOUNT;

    // When speaking: sharper emphasis bob + affirmative nods + intensified cursor tracking.
    if (speaking) {
      bob += Math.sin(t * SPEAK_EMPHASIS_SPEED) * TARGET_HEIGHT * SPEAK_EMPHASIS_AMOUNT;
      sway += Math.sin(t * SPEAK_NOD_SPEED) * SPEAK_NOD_AMOUNT;
    }

    const targetX = pose.xNorm * viewport.width * DRIFT_X_FACTOR;
    damp3(g.position, [targetX, pose.y + bob, pose.z], 0.6, delta);

    const lookIntensity = speaking ? SPEAK_LOOK_INTENSITY : 1;
    const cursorYaw = THREE.MathUtils.clamp(pointer.x * CURSOR_YAW_CLAMP * lookIntensity, -CURSOR_YAW_CLAMP, CURSOR_YAW_CLAMP);
    const cursorTilt = THREE.MathUtils.clamp(-pointer.y * CURSOR_TILT_CLAMP * lookIntensity, -CURSOR_TILT_CLAMP, CURSOR_TILT_CLAMP);
    dampAngle(g.rotation, 'y', pose.rotationY + sway + cursorYaw, 0.5, delta);
    dampAngle(g.rotation, 'x', cursorTilt, 0.5, delta);

    // Chapter scale emphasis eases smoothly; a click pulse rides on top, undamped, for snappy juice.
    damp(scaleState.current, 'base', pose.scale, 0.4, delta);
    let pulse = 0;
    if (pulseElapsed.current !== null) {
      pulseElapsed.current += delta;
      const pt = pulseElapsed.current / CLICK_PULSE_DURATION;
      if (pt >= 1) {
        pulseElapsed.current = null;
      } else {
        pulse = CLICK_PULSE_AMOUNT * Math.sin(pt * Math.PI);
      }
    }
    g.scale.setScalar(scaleState.current.base * (1 + pulse));

    // Holographic speech ring: pulses outward from the avatar's feet while TTS is active.
    const ring = ringRef.current;
    if (ring) {
      const ringScale = speaking ? 1 + Math.sin(t * 6) * 0.08 : 1;
      ring.scale.setScalar(ringScale);
      (ring.material as THREE.MeshBasicMaterial).opacity = speaking ? 0.35 + Math.sin(t * 8) * 0.15 : 0;
      ring.rotation.z = t * 0.3;
    }
  });

  const handleClick = () => {
    sound.play('tap');
    pulseElapsed.current = 0;
  };

  return (
    <group
      ref={group}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; sound.play('hover'); }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <primitive object={scene} />
      {/* Holographic speech ring — only visible while Digital Kundan is talking. */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[0.55, 0.6, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

useGLTF.preload(BASE);
