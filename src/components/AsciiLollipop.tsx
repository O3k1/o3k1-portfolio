import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { AsciiRenderer } from '@react-three/drei';
import { RotateCw, Hand, Sparkles } from 'lucide-react';

interface PhysicsState {
  isDragging: boolean;
  lastPointerX: number;
  lastPointerY: number;
  lastMoveTime: number;
  velX: number; // yaw angular velocity (around Y axis)
  velY: number; // pitch angular velocity (around X axis)
  rotX: number;
  rotY: number;
  rotZ: number;
}

interface LollipopSceneProps {
  physicsRef: React.MutableRefObject<PhysicsState>;
  onTelemetryTick: (rpm: number, mode: 'AUTO' | 'DRAG' | 'FLICK') => void;
}

/**
 * Generates a high-contrast procedural candy swirl texture so the 3D lollipop head
 * produces rich, unmistakable Archimedes spiral bands in ASCII characters (@ # * + : .)
 * across every viewing angle.
 */
function createSwirlTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy) / maxR;
        const theta = Math.atan2(dy, dx);

        // Two-arm tight candy swirl + secondary harmonic groove
        const spiralPhase = theta * 2.0 + r * 15.5;
        const swirlWave = Math.sin(spiralPhase);
        const fineGroove = Math.cos(spiralPhase * 2.0) * 0.15;

        // Rim darkening so the circular disc silhouette stays razor-sharp in ASCII
        const rimVignette = Math.pow(Math.min(1, r), 2.2) * 0.38;

        // Combine into brightness [18 .. 240]
        // Dark bands -> '#' and '@', light bands -> '.' and ':' and '+'
        let normalized = 0.52 + 0.42 * swirlWave + fineGroove - rimVignette;
        normalized = Math.max(0.06, Math.min(0.95, normalized));

        const lum = Math.floor(normalized * 255);
        const idx = (y * size + x) * 4;
        data[idx] = lum;
        data[idx + 1] = lum;
        data[idx + 2] = lum;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates 3D spiral tube geometry for tactile raised candy relief on both faces
 * of the lollipop head, ensuring 3D normal variations even when viewed obliquely.
 */
function createSpiralReliefGeometry(zOffset: number, direction: 1 | -1): THREE.TubeGeometry {
  const points: THREE.Vector3[] = [];
  const turns = 3.1;
  const steps = 140;
  const maxRadius = 1.32;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns * direction;
    const radius = 0.08 + t * maxRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    // Follow the gentle spherical dome profile of the lollipop head
    const domeZ = Math.sqrt(Math.max(0, 1 - Math.pow(radius / 1.52, 2))) * 0.42;
    const z = zOffset > 0 ? domeZ : -domeZ;
    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, 120, 0.075, 10, false);
}

const LollipopMesh: React.FC<LollipopSceneProps> = ({ physicsRef, onTelemetryTick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const swirlHeadRef = useRef<THREE.Group>(null);
  const frameCounterRef = useRef(0);

  const swirlTexture = useMemo(() => createSwirlTexture(), []);
  const frontSpiralGeo = useMemo(() => createSpiralReliefGeometry(1, 1), []);
  const backSpiralGeo = useMemo(() => createSpiralReliefGeometry(-1, -1), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = physicsRef.current;

    const baseAutoSpinY = 0.75; // rad/s gentle idle auto-rotation
    const baseAutoRollZ = 0.14; // subtle secondary tilt oscillation

    if (!p.isDragging) {
      // Exponential momentum/inertia damping when flicked, smoothly settling into baseAutoSpinY
      const dampingFactor = Math.pow(0.945, dt * 60);
      p.velX = baseAutoSpinY + (p.velX - baseAutoSpinY) * dampingFactor;
      p.velY = p.velY * dampingFactor;

      // Gently relax extreme vertical pitch back toward showcase tilt (-0.18 rad)
      const targetPitch = -0.18;
      p.rotX += (targetPitch - p.rotX) * 0.03 * (dt * 60);

      p.rotY += p.velX * dt;
      p.rotX += p.velY * dt;
    }

    // Clamp pitch so the lollipop never flips upside-down awkwardly while dragging
    p.rotX = Math.max(-1.25, Math.min(1.25, p.rotX));

    if (groupRef.current) {
      groupRef.current.rotation.x = p.rotX;
      groupRef.current.rotation.y = p.rotY;
      groupRef.current.rotation.z = baseAutoRollZ + Math.sin(p.rotY * 0.5) * 0.06;
    }

    // Slowly counter-rotate the inner swirl texture slightly for extra visual life
    if (swirlHeadRef.current) {
      swirlHeadRef.current.rotation.z += dt * 0.25;
    }

    // Update UI telemetry ~10 times per second to avoid unnecessary React re-renders
    frameCounterRef.current += 1;
    if (frameCounterRef.current % 6 === 0) {
      const totalOmega = Math.sqrt(p.velX * p.velX + p.velY * p.velY);
      const rpm = Math.round((totalOmega * 60) / (Math.PI * 2));
      const excessVelocity = Math.abs(p.velX - baseAutoSpinY) + Math.abs(p.velY);
      const mode: 'AUTO' | 'DRAG' | 'FLICK' = p.isDragging
        ? 'DRAG'
        : excessVelocity > 0.45
          ? 'FLICK'
          : 'AUTO';
      onTelemetryTick(rpm, mode);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.22, 0]}>
      {/* LOLLIPOP HEAD (Swirled Disc / Domed Sphere Head) */}
      <group ref={swirlHeadRef} position={[0, 0.88, 0]}>
        {/* Main plump candy disc/sphere body with procedural swirl texture */}
        <mesh scale={[1, 1, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.48, 1.48, 0.85, 48, 1, false]} />
          <meshStandardMaterial
            map={swirlTexture}
            roughness={0.35}
            metalness={0.08}
          />
        </mesh>

        {/* Rounded dome caps on front & back for organic 3D curvature */}
        <mesh scale={[1.46, 1.46, 0.46]}>
          <sphereGeometry args={[1, 48, 32]} />
          <meshStandardMaterial
            map={swirlTexture}
            roughness={0.32}
            metalness={0.1}
          />
        </mesh>

        {/* Raised 3D spiral candy ridges on front and back faces for deep ASCII shadow relief */}
        <mesh geometry={frontSpiralGeo}>
          <meshStandardMaterial color="#181818" roughness={0.6} metalness={0.05} />
        </mesh>
        <mesh geometry={backSpiralGeo}>
          <meshStandardMaterial color="#181818" roughness={0.6} metalness={0.05} />
        </mesh>

        {/* Classic equatorial pressed-sugar seam ring around the lollipop perimeter */}
        <mesh>
          <torusGeometry args={[1.48, 0.11, 18, 64]} />
          <meshStandardMaterial color="#9E9E9E" roughness={0.4} metalness={0.15} />
        </mesh>

        {/* Center bullseye candy button on both faces */}
        <mesh position={[0, 0, 0.44]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#101010" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.44]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#101010" roughness={0.5} />
        </mesh>
      </group>

      {/* CANDY WRAPPER COLLAR / NECK RING */}
      <group position={[0, -0.62, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.07, 12, 24]} />
          <meshStandardMaterial color="#252525" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.09, 0]}>
          <cylinderGeometry args={[0.24, 0.14, 0.18, 20]} />
          <meshStandardMaterial color="#4A4A4A" roughness={0.5} />
        </mesh>
      </group>

      {/* CYLINDRICAL LOLLIPOP STICK */}
      <group position={[0, -1.78, 0]}>
        <mesh>
          <cylinderGeometry args={[0.115, 0.115, 2.25, 24]} />
          <meshStandardMaterial color="#BDBDBD" roughness={0.45} metalness={0.05} />
        </mesh>
        {/* Subtle spiral paper-stick seam rings so the stick shows crisp ASCII shading */}
        {[-0.75, -0.35, 0.05, 0.45, 0.85].map((yPos, idx) => (
          <mesh key={idx} position={[0, yPos, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.118, 0.018, 8, 20]} />
            <meshStandardMaterial color="#303030" roughness={0.6} />
          </mesh>
        ))}
        {/* Rounded bottom tip of the stick */}
        <mesh position={[0, -1.12, 0]}>
          <sphereGeometry args={[0.115, 16, 16]} />
          <meshStandardMaterial color="#8A8A8A" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

export const AsciiLollipop: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingUi, setIsDraggingUi] = useState(false);
  const [rpm, setRpm] = useState<number>(7);
  const [spinMode, setSpinMode] = useState<'AUTO' | 'DRAG' | 'FLICK'>('AUTO');
  const [resolution, setResolution] = useState<number>(0.22);

  const physicsRef = useRef<PhysicsState>({
    isDragging: false,
    lastPointerX: 0,
    lastPointerY: 0,
    lastMoveTime: performance.now(),
    velX: 0.75,
    velY: 0,
    rotX: -0.18,
    rotY: 0.4,
    rotZ: 0.14,
  });

  const handleTelemetryTick = useCallback((nextRpm: number, nextMode: 'AUTO' | 'DRAG' | 'FLICK') => {
    setRpm(nextRpm);
    setSpinMode(nextMode);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore clicks on overlay buttons
    if ((e.target as HTMLElement).closest('button')) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    const p = physicsRef.current;
    p.isDragging = true;
    p.lastPointerX = e.clientX;
    p.lastPointerY = e.clientY;
    p.lastMoveTime = performance.now();
    setIsDraggingUi(true);
    setSpinMode('DRAG');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = physicsRef.current;
    if (!p.isDragging) return;

    const now = performance.now();
    const dtMs = Math.max(4, now - p.lastMoveTime);
    const dx = e.clientX - p.lastPointerX;
    const dy = e.clientY - p.lastPointerY;

    // Directly rotate specimen with cursor movement
    const sensitivity = 0.011;
    p.rotY += dx * sensitivity;
    p.rotX += dy * sensitivity;

    // Track instantaneous flick velocity (rad/s) with smoothing
    const instantVelX = (dx * sensitivity) / (dtMs / 1000);
    const instantVelY = (dy * sensitivity) / (dtMs / 1000);

    // Clamp max flick velocity to keep ASCII legibility while feeling fast and kinetic
    const maxFlick = 22.0;
    p.velX = Math.max(-maxFlick, Math.min(maxFlick, p.velX * 0.25 + instantVelX * 0.75));
    p.velY = Math.max(-maxFlick, Math.min(maxFlick, p.velY * 0.25 + instantVelY * 0.75));

    p.lastPointerX = e.clientX;
    p.lastPointerY = e.clientY;
    p.lastMoveTime = now;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = physicsRef.current;
    if (!p.isDragging) return;

    // If the user held the pointer still for >120ms before releasing, decay the flick velocity
    const timeSinceLastMove = performance.now() - p.lastMoveTime;
    if (timeSinceLastMove > 120) {
      p.velX *= 0.25;
      p.velY *= 0.25;
    }

    p.isDragging = false;
    setIsDraggingUi(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore if pointer capture was already released
    }
  };

  const triggerFlickImpulse = () => {
    const p = physicsRef.current;
    p.velX = 14.5;
    p.velY = -2.2;
    setSpinMode('FLICK');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const p = physicsRef.current;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      p.velX = Math.min(18, p.velX + 4.5);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      p.velX = Math.max(-18, p.velX - 4.5);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      p.velY = Math.max(-12, p.velY - 3.0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      p.velY = Math.min(12, p.velY + 3.0);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      triggerFlickImpulse();
    }
  };

  // Ensure text selection stays disabled globally while dragging
  useEffect(() => {
    if (isDraggingUi) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.userSelect = '';
    };
  }, [isDraggingUi]);

  return (
    <div className="relative flex flex-col border border-ink bg-paper">
      {/* Top Specimen Plate Header Bar */}
      <div className="flex items-center justify-between border-b border-ink px-3.5 py-2 text-xs font-mono text-pencil bg-paper-warm/60">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 border border-ink bg-ink" aria-hidden="true" />
          <span className="uppercase tracking-wider text-ink font-medium">
            FIG. 01 — SWIRLED SPECIMEN (ASCII RASTER)
          </span>
        </div>
        <div className="flex items-center gap-3 tabular-nums">
          <span className="hidden sm:inline text-pencil">CHARSET: [@#*+:.]</span>
          <span className="border border-ink/40 bg-paper px-1.5 py-0.5 text-[11px] text-ink">
            {spinMode === 'DRAG'
              ? 'MANUAL DRAG'
              : spinMode === 'FLICK'
                ? `INERTIA · ${rpm} RPM`
                : `IDLE · ${rpm} RPM`}
          </span>
        </div>
      </div>

      {/* Interactive 3D ASCII Viewport */}
      <div
        ref={containerRef}
        role="application"
        tabIndex={0}
        aria-label="Interactive 3D ASCII Lollipop Specimen. Drag or flick with cursor to spin, or press Space and Arrow keys to rotate."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        className={`ascii-viewport-container drafting-grid relative h-[380px] sm:h-[430px] w-full overflow-hidden select-none transition-colors ${
          isDraggingUi ? 'cursor-grabbing bg-paper-warm/40' : 'cursor-grab'
        }`}
      >
        {/* Corner Registration Marks (Architect Sketchbook Style) */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 h-3 w-3 border-t border-l border-ink/60" />
        <div className="pointer-events-none absolute top-2.5 right-2.5 h-3 w-3 border-t border-r border-ink/60" />
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 h-3 w-3 border-b border-l border-ink/60" />
        <div className="pointer-events-none absolute bottom-2.5 right-2.5 h-3 w-3 border-b border-r border-ink/60" />

        {/* Handwritten Margin Annotation inside Viewport */}
        <div className="pointer-events-none absolute top-3 left-4 z-10 flex flex-col">
          <span className="font-handwriting text-lg sm:text-xl text-ink leading-tight">
            grab &amp; flick to spin -&gt;
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-pencil">
            damped angular momentum (ω)
          </span>
        </div>

        {/* Scale Ruler Marks on Right Margin */}
        <div
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-end gap-3 text-[9px] font-mono text-pencil/80 tabular-nums"
          aria-hidden="true"
        >
          <span>+20mm —</span>
          <span>+10mm -</span>
          <span>0.0mm —</span>
          <span>-10mm -</span>
          <span>-20mm —</span>
        </div>

        {/* Three.js Canvas with @react-three/drei AsciiRenderer */}
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 44 }}
          gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.45} />
          <directionalLight position={[4.5, 5.5, 6.0]} intensity={2.1} />
          <directionalLight position={[-4.5, -2.5, 3.5]} intensity={0.75} />
          <pointLight position={[0, 3.0, 4.0]} intensity={0.9} />

          <LollipopMesh physicsRef={physicsRef} onTelemetryTick={handleTelemetryTick} />

          <AsciiRenderer
            key={resolution}
            fgColor="#1C1B18"
            bgColor="transparent"
            characters=" .:+*#@"
            invert={false}
            color={false}
            resolution={resolution}
          />
        </Canvas>

        {/* Bottom Interactive Controls Bar inside Specimen Frame */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 border border-ink/70 bg-paper/95 px-2.5 py-1 text-[11px] font-mono text-pencil">
            <Hand className="h-3 w-3 text-ink" aria-hidden="true" />
            <span>Drag anywhere or flick</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() =>
                setResolution((prev) => (prev === 0.22 ? 0.27 : prev === 0.27 ? 0.18 : 0.22))
              }
              className="inline-flex items-center gap-1 border border-ink bg-paper px-2.5 py-1 text-[11px] font-mono text-ink hover:bg-ink hover:text-paper transition-colors"
              aria-label="Cycle ASCII character grid resolution"
              title="Toggle ASCII Mesh Density"
            >
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              <span className="tabular-nums">
                PITCH: {resolution === 0.27 ? 'FINE' : resolution === 0.22 ? 'STD' : 'COARSE'}
              </span>
            </button>

            <button
              type="button"
              onClick={triggerFlickImpulse}
              className="inline-flex items-center gap-1 border border-ink bg-paper px-2.5 py-1 text-[11px] font-mono text-ink hover:bg-ink hover:text-paper transition-colors"
              aria-label="Flick-spin the 3D ASCII lollipop"
            >
              <RotateCw className="h-3 w-3" aria-hidden="true" />
              <span>FLICK SPIN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Specimen Caption Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink px-3.5 py-2 text-[11px] font-mono text-pencil bg-paper">
        <span>RENDERER: R3F + DREI ASCIIEFFECT (#1C1B18 INK)</span>
        <span className="tabular-nums">SCALE 1:1 · DAMPING μ=0.945</span>
      </div>
    </div>
  );
};
