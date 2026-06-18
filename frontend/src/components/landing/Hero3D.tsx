"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

function Waveform() {
  const lineRef = useRef<any>(null);
  const pointsCount = 100;
  
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < pointsCount; i++) {
      pts.push(new THREE.Vector3((i / pointsCount) * 10 - 5, 0, 0));
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      const time = clock.getElapsedTime();
      const positions = lineRef.current.geometry.attributes.position.array;
      for (let i = 0; i < pointsCount; i++) {
        const x = (i / pointsCount) * 10 - 5;
        // Create a sine wave that animates over time
        const y = Math.sin(x * 2 + time * 3) * Math.exp(-x * x / 10) * 1.5;
        positions[i * 3 + 1] = y;
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      color="#0d9488" // Teal 600
      lineWidth={3}
      transparent
      opacity={0.8}
    />
  );
}

function FloatingNodes() {
  const groupRef = useRef<THREE.Group>(null);
  
  const nodes = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5 - 2
      ] as [number, number, number],
      speed: Math.random() * 0.5 + 0.1,
      offset: Math.random() * Math.PI * 2
    }));
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      groupRef.current.children.forEach((child, i) => {
        child.position.y += Math.sin(time * nodes[i].speed + nodes[i].offset) * 0.005;
        child.rotation.x += 0.01;
        child.rotation.y += 0.01;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Sphere key={i} position={node.position} args={[0.08, 16, 16]}>
          <meshStandardMaterial color={i % 3 === 0 ? "#4f46e5" : "#0d9488"} emissive={i % 3 === 0 ? "#4f46e5" : "#0d9488"} emissiveIntensity={0.5} wireframe />
        </Sphere>
      ))}
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60 dark:opacity-40">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Waveform />
        <FloatingNodes />
      </Canvas>
    </div>
  );
}
