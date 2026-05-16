import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Stars, Sparkles } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh, Group } from "three";

function Knot() {
  const ref = useRef<Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) {
      ref.current.rotation.x += d * 0.15;
      ref.current.rotation.y += d * 0.22;
    }
  });
  return (
    <mesh ref={ref} scale={1.7}>
      <torusKnotGeometry args={[1, 0.3, 240, 32]} />
      <MeshDistortMaterial
        color="#4f46e5"
        distort={0.45}
        speed={2.2}
        roughness={0.05}
        metalness={0.9}
        emissive="#ff7a1a"
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

function InnerSphere() {
  const ref = useRef<Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.4;
  });
  return (
    <mesh ref={ref} scale={0.9}>
      <icosahedronGeometry args={[1, 4]} />
      <MeshDistortMaterial
        color="#00d4ff"
        distort={0.6}
        speed={3}
        roughness={0.1}
        metalness={0.8}
        emissive="#7c5cff"
        emissiveIntensity={0.4}
        wireframe
      />
    </mesh>
  );
}

const ORBIT_COLORS = ["#ff7a1a", "#7c5cff", "#00d4ff", "#ffffff", "#ff4d8d", "#19f5b5"];

function OrbitingCubes() {
  const group = useRef<Group>(null);
  useFrame((_, d) => {
    if (group.current) {
      group.current.rotation.y += d * 0.2;
      group.current.rotation.x += d * 0.05;
    }
  });
  return (
    <group ref={group}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 3.8;
        const color = ORBIT_COLORS[i % ORBIT_COLORS.length];
        return (
          <Float key={i} speed={1.8} rotationIntensity={1.6} floatIntensity={1.4}>
            <mesh position={[Math.cos(a) * r, Math.sin(a * 2) * 0.8, Math.sin(a) * r]}>
              {i % 3 === 0 ? (
                <octahedronGeometry args={[0.32]} />
              ) : i % 3 === 1 ? (
                <boxGeometry args={[0.38, 0.38, 0.38]} />
              ) : (
                <tetrahedronGeometry args={[0.36]} />
              )}
              <meshStandardMaterial
                color={color}
                metalness={0.85}
                roughness={0.15}
                emissive={color}
                emissiveIntensity={0.5}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

export function Scene3D({ interactive = false }: { interactive?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 5, 5]} intensity={1.4} color="#ff7a1a" />
        <pointLight position={[-5, -5, -5]} intensity={1.2} color="#7c5cff" />
        <pointLight position={[0, 5, -5]} intensity={0.9} color="#00d4ff" />
        <Stars radius={60} depth={50} count={2200} factor={3.5} fade speed={1} />
        <Sparkles count={80} scale={8} size={3} speed={0.4} color="#ff7a1a" />
        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.9}>
          <Knot />
          <InnerSphere />
        </Float>
        <OrbitingCubes />
        {interactive && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />}
      </Suspense>
    </Canvas>
  );
}
