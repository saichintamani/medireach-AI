"use client";

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrganMeshProps {
  hasDisease: boolean;
  organType: 'heart' | 'lungs';
}

export function OrganMesh({ hasDisease, organType }: OrganMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    if (hasDisease) {
      // Freeze / Glitch effect
      // Extremely rapid, chaotic micro-movements
      meshRef.current.position.x = (Math.random() - 0.5) * 0.1;
      meshRef.current.position.y = (Math.random() - 0.5) * 0.1;
      // Change color to warning red/magenta
      materialRef.current.color.lerp(new THREE.Color('#ff0055'), 0.1);
      materialRef.current.emissive.lerp(new THREE.Color('#ff0022'), 0.1);
      
      // Force camera zoom (freeze zoom)
      state.camera.position.lerp(new THREE.Vector3(0, 0, 3), 0.05);
    } else {
      // Normal beating/breathing animation
      time.current += delta;
      
      // Smooth reset of camera
      state.camera.position.lerp(new THREE.Vector3(0, 0, 6), 0.05);
      meshRef.current.position.set(0, 0, 0);

      // Pink 3D Portfolio default color
      materialRef.current.color.lerp(new THREE.Color('#ff66b2'), 0.05);
      materialRef.current.emissive.lerp(new THREE.Color('#ff3399'), 0.05);

      if (organType === 'heart') {
        // Heartbeat pulse: sharp contraction, slow release
        const pulse = 1 + 0.15 * Math.pow(Math.sin(time.current * 4), 4);
        meshRef.current.scale.set(pulse, pulse, pulse);
        meshRef.current.rotation.y += 0.01;
      } else {
        // Lungs breathing: slow expansion and contraction
        const breath = 1 + 0.2 * Math.sin(time.current * 2);
        meshRef.current.scale.set(breath, breath, breath);
        meshRef.current.rotation.y = Math.sin(time.current * 0.5) * 0.2;
      }
    }
  });

  return (
    <group ref={meshRef}>
      {organType === 'heart' ? (
        // Mock Heart shape using overlapping geometries
        <group>
          <mesh position={[-0.5, 0.5, 0]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial ref={materialRef} color="#ff66b2" emissive="#ff3399" emissiveIntensity={0.6} wireframe />
          </mesh>
          <mesh position={[0.5, 0.5, 0]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#ff66b2" emissive="#ff3399" emissiveIntensity={0.6} wireframe />
          </mesh>
          <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial color="#ff66b2" emissive="#ff3399" emissiveIntensity={0.6} wireframe />
          </mesh>
        </group>
      ) : (
        // Mock Lungs
        <group>
          <mesh position={[-1.2, 0, 0]} scale={[0.8, 1.5, 0.8]}>
            <capsuleGeometry args={[1, 2, 16, 32]} />
            <meshStandardMaterial ref={materialRef} color="#ff66b2" emissive="#ff3399" emissiveIntensity={0.4} wireframe />
          </mesh>
          <mesh position={[1.2, 0, 0]} scale={[0.8, 1.5, 0.8]}>
            <capsuleGeometry args={[1, 2, 16, 32]} />
            <meshStandardMaterial color="#ff66b2" emissive="#ff3399" emissiveIntensity={0.4} wireframe />
          </mesh>
        </group>
      )}
    </group>
  );
}
