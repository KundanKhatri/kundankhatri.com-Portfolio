'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { scrollState } from '@/lib/useScrollProgress';
import { sound } from '@/lib/sound';

const BASE = '/models/robot-kundan.glb';
const CLIP_PATHS = [
  '/models/clips/arise.glb',
  '/models/clips/idle.glb',
  '/models/clips/walking.glb',
  '/models/clips/running.glb',
  '/models/clips/wave.glb',
  '/models/clips/bigwave.glb',
  '/models/clips/backflip.glb',
  '/models/clips/jazzhands.glb',
];

/** Story section -> looping clip. Index = scroll section. */
const SECTION_CLIP = ['Idle', 'Idle', 'Walking', 'Wave', 'Idle', 'Idle', 'BigWave'];
const EASTER_EGGS = ['JazzHands', 'Backflip'] as const;
const RUN_VELOCITY = 0.004; // scroll velocity that promotes Walking -> Running

export function Robot() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(BASE);
  const clipFiles = useGLTF(CLIP_PATHS);
  const allClips = useMemo(
    () => clipFiles.flatMap((f) => f.animations),
    [clipFiles],
  );
  const { actions, mixer } = useAnimations(allClips, group);
  const current = useRef<string | null>(null);
  const headBone = useRef<THREE.Bone | null>(null);
  const [hasBooted, setHasBooted] = useState(false);
  const eggIndex = useRef(0);
  const { viewport, pointer } = useThree();

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.frustumCulled = false;
      }
      if ((obj as THREE.Bone).isBone && /head/i.test(obj.name) && !headBone.current) {
        headBone.current = obj as THREE.Bone;
      }
    });
  }, [scene]);

  /** Play a clip once, then fall back to the section loop. */
  const playOnce = (name: string) => {
    const action = actions[name];
    if (!action) return;
    const prev = current.current ? actions[current.current] : null;
    prev?.fadeOut(0.25);
    action.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.25).play();
    action.clampWhenFinished = true;
    current.current = name;
    const onDone = (e: { action: THREE.AnimationAction }) => {
      if (e.action !== action) return;
      mixer.removeEventListener('finished', onDone as never);
      current.current = null; // frame loop re-selects the section clip
    };
    mixer.addEventListener('finished', onDone as never);
  };

  // Boot sequence: Arise once on first load.
  useEffect(() => {
    if (!hasBooted && actions['Arise']) {
      playOnce('Arise');
      setHasBooted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot runs exactly once when actions resolve
  }, [actions, hasBooted]);

  // While Digital Kundan is talking (TTS active), play the Wave clip on loop and remember the
  // previously running clip so we can restore it when speech ends.
  const prevLoop = useRef<string | null>(null);
  useEffect(() => {
    const onSpeak = (e: Event) => {
      const speaking = (e as CustomEvent<boolean>).detail;
      if (speaking) {
        if (current.current && current.current !== 'Wave' && current.current !== 'BigWave') {
          prevLoop.current = current.current;
        }
        const wave = actions['Wave'];
        const big = actions['BigWave'];
        const target = big ?? wave;
        if (!target) return;
        // Loop Wave during long replies so it never looks frozen.
        const prev = current.current ? actions[current.current] : null;
        target.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.25).play();
        prev?.fadeOut(0.25);
        current.current = target === big ? 'BigWave' : 'Wave';
      } else if (prevLoop.current) {
        // Speech ended — restore the section loop.
        const restore = actions[prevLoop.current];
        if (restore) {
          const prev = current.current ? actions[current.current] : null;
          restore.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
          prev?.fadeOut(0.4);
          current.current = prevLoop.current;
          prevLoop.current = null;
        }
      }
    };
    window.addEventListener('kk-speaking', onSpeak);
    return () => window.removeEventListener('kk-speaking', onSpeak);
  }, [actions]);

  useFrame(() => {
    if (!group.current) return;
    const p = scrollState.progress;
    const sec = Math.min(scrollState.section, SECTION_CLIP.length - 1);
    const speed = Math.abs(scrollState.velocity);

    // Drift along an S-curve so the robot always shares the frame with the copy.
    const x = Math.sin(p * Math.PI * 2) * viewport.width * 0.22;
    const y = -0.95 + Math.sin(p * Math.PI) * 0.12;
    const z = Math.cos(p * Math.PI) * 0.5;
    group.current.position.lerp(new THREE.Vector3(x, y, z), 0.05);

    // Face direction of travel; lean with scroll velocity.
    const targetRotY = Math.sin(p * Math.PI * 2) * 0.9 + scrollState.velocity * 30;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.06);

    // Head tracks the cursor.
    if (headBone.current) {
      headBone.current.rotation.y = THREE.MathUtils.lerp(headBone.current.rotation.y, pointer.x * 0.45, 0.12);
      headBone.current.rotation.x = THREE.MathUtils.lerp(headBone.current.rotation.x, -pointer.y * 0.25, 0.12);
    }

    // Choose the loop clip; fast scrolling upgrades Walking to Running.
    let want = SECTION_CLIP[sec] ?? 'Idle';
    if (want === 'Walking' && speed > RUN_VELOCITY) want = 'Running';

    const active = current.current;
    const isOneShot = active === 'Arise' || (EASTER_EGGS as readonly string[]).includes(active ?? '');
    const nextAction = actions[want];
    if (!isOneShot && active !== want && nextAction) {
      const prev = active ? actions[active] : null;
      nextAction.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
      prev?.fadeOut(0.4);
      current.current = want;
    }
    // Movement clips speed up with scroll velocity.
    const activeAction = current.current ? actions[current.current] : null;
    if (current.current && activeAction) {
      const isMoving = /Walking|Running/.test(current.current);
      activeAction.timeScale = isMoving ? 0.8 + Math.min(2, speed * 300) : 1;
    }
  });

  const handleClick = () => {
    const egg = EASTER_EGGS[eggIndex.current % EASTER_EGGS.length];
    eggIndex.current += 1;
    sound.play('click');
    playOnce(egg);
  };

  return (
    <primitive
      ref={group}
      object={scene}
      scale={1.15}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; sound.play('hover'); }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    />
  );
}

useGLTF.preload(BASE);
CLIP_PATHS.forEach((p) => useGLTF.preload(p));
