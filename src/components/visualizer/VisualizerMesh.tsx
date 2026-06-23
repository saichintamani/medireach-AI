"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioAnalyzer } from '@/lib/audioAnalyzer';

interface VisualizerProps {
  colorScheme: string;
  speedMultiplier: number;
  geometryMode: string;
}

export function VisualizerMesh({ colorScheme, speedMultiplier, geometryMode }: VisualizerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const baseColor = new THREE.Color(colorScheme);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    // Agent-controlled rotation speed
    meshRef.current.rotation.x += 0.005 * speedMultiplier;
    meshRef.current.rotation.y += 0.005 * speedMultiplier;

    // Get live audio data
    const bass = audioAnalyzer.getAverageFrequency('bass');
    const mid = audioAnalyzer.getAverageFrequency('mid');
    
    // Scale mesh based on bass
    const targetScale = 1 + (bass / 255) * 1.5;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // Color mixing based on audio and Agent's colorScheme
    const r = Math.min(1, baseColor.r + (mid / 510));
    const g = Math.min(1, baseColor.g + (bass / 510));
    const b = Math.min(1, baseColor.b + (bass / 255));
    
    const targetColor = new THREE.Color(r, g, b);
    materialRef.current.color.lerp(targetColor, 0.1);
    materialRef.current.emissive.lerp(targetColor, 0.1);
    materialRef.current.emissiveIntensity = 0.5 + (bass / 255);
  });

  return (
    <mesh ref={meshRef}>
      {geometryMode === 'sphere' && <sphereGeometry args={[2, 32, 32]} />}
      {geometryMode === 'torus' && <torusGeometry args={[2, 0.5, 16, 100]} />}
      {geometryMode !== 'sphere' && geometryMode !== 'torus' && <icosahedronGeometry args={[2, 2]} />}
      
      <meshStandardMaterial 
        ref={materialRef}
        color={colorScheme}
        emissive={colorScheme}
        emissiveIntensity={0.5}
        wireframe={true}
      />
    </mesh>
  );
}
