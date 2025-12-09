"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

function GlowingDots() {
  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    pointsRef.current.rotation.y += delta * 0.5;
    pointsRef.current.rotation.x += delta * 0.2;

    // Пульсация
    const t = state.clock.elapsedTime;
    const scale = 1 + Math.sin(t * 2) * 0.05; 
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={pointsRef}>
      <icosahedronGeometry args={[1.4, 2]} />
      
      <pointsMaterial
        color="#84cc16"       
        size={0.12}           
        transparent={true}
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending} // Свечение
        depthWrite={false}
      />
    </points>
  );
}

export function ThinkingPlanet({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Canvas
        camera={{ position: [0, 0, 3.5] }}
        gl={{ alpha: true, antialias: true }}
        className="pointer-events-none"
      >
        <GlowingDots />
      </Canvas>
    </div>
  );
}