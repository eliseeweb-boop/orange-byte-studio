import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Points, PointMaterial, Sparkles } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Points as PointsType, Group } from "three";

// Generate a swirling galaxy of points
function GalaxyPoints({
  count = 12000,
  radius = 6,
  branches = 4,
  spin = 1.1,
  randomness = 0.55,
  randomnessPower = 3,
  insideColor = "#a5b4fc",
  outsideColor = "#1e1e5a",
}: {
  count?: number;
  radius?: number;
  branches?: number;
  spin?: number;
  randomness?: number;
  randomnessPower?: number;
  insideColor?: string;
  outsideColor?: string;
}) {
  const ref = useRef<PointsType>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cIn = new THREE.Color(insideColor);
    const cOut = new THREE.Color(outsideColor);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 1.4) * radius;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = r * spin;

      const rx = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const ry = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r * 0.4;
      const rz = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + rx;
      positions[i3 + 1] = ry;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;

      const mixed = cIn.clone().lerp(cOut, r / radius);
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    return [positions, colors];
  }, [count, radius, branches, spin, randomness, randomnessPower, insideColor, outsideColor]);

  useFrame((_, d) => {
    if (ref.current) {
      ref.current.rotation.y += d * 0.08;
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Soft background field of stars
function StarField({ count = 2500 }: { count?: number }) {
  const ref = useRef<PointsType>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // sphere shell
      const r = 18 + Math.random() * 12;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      arr[i3] = r * Math.sin(p) * Math.cos(t);
      arr[i3 + 1] = r * Math.sin(p) * Math.sin(t);
      arr[i3 + 2] = r * Math.cos(p);
    }
    return arr;
  }, [count]);

  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y -= d * 0.01;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#c4b5fd"
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function GalaxyGroup() {
  const group = useRef<Group>(null);
  useFrame((_, d) => {
    if (group.current) {
      group.current.rotation.x = Math.sin(performance.now() * 0.0002) * 0.15 - 0.25;
      group.current.rotation.z += d * 0.02;
    }
  });
  return (
    <group ref={group}>
      <GalaxyPoints />
    </group>
  );
}

export function Scene3D({ interactive = false }: { interactive?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 2.5, 7], fov: 55 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <StarField />
        <GalaxyGroup />
        <Sparkles count={120} scale={10} size={2.5} speed={0.3} color="#818cf8" />
        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
            rotateSpeed={0.3}
          />
        )}
      </Suspense>
    </Canvas>
  );
}
