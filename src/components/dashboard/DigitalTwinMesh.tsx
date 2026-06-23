"use client";

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface DigitalTwinMeshProps {
  onSelectOrgan: (organ: string | null) => void;
  selectedOrgan: string | null;
}

export function DigitalTwinMesh({ onSelectOrgan, selectedOrgan }: DigitalTwinMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    time.current += delta;
    
    if (!selectedOrgan) {
      groupRef.current.rotation.y += delta * 0.2;
      state.camera.position.lerp(new THREE.Vector3(0, 1, 8), 0.05);
      state.camera.lookAt(0, 1, 0);
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
      
      let targetPos = new THREE.Vector3(0, 1, 8);
      let targetLook = new THREE.Vector3(0, 1, 0);

      if (selectedOrgan === 'Heart') {
        targetPos.set(-0.2, 2.0, 2.5);
        targetLook.set(-0.4, 2.0, 0.2);
      } else if (selectedOrgan === 'Lungs') {
        targetPos.set(0, 2.2, 3.5);
        targetLook.set(0, 2.2, 0);
      } else if (selectedOrgan === 'Brain') {
        targetPos.set(0, 3.5, 3);
        targetLook.set(0, 3.5, 0);
      } else if (selectedOrgan === 'Liver' || selectedOrgan === 'Kidneys') {
        targetPos.set(0, 1.0, 4);
        targetLook.set(0, 1.0, 0);
      }

      state.camera.position.lerp(targetPos, 0.08);
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Central spine */}
      <mesh position={[0, 1.5, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 16]} />
        <meshStandardMaterial color="#334155" wireframe opacity={0.1} transparent />
      </mesh>

      {/* BRAIN */}
      <BrainMesh 
        position={[0, 3.5, 0]} 
        isSelected={selectedOrgan === 'Brain'} 
        isDimmed={selectedOrgan !== null && selectedOrgan !== 'Brain'}
        onClick={() => onSelectOrgan('Brain')} 
      />
      
      {/* HEART */}
      <HeartMesh 
        position={[-0.4, 2.0, 0.2]} 
        isSelected={selectedOrgan === 'Heart'} 
        isDimmed={selectedOrgan !== null && selectedOrgan !== 'Heart'}
        onClick={() => onSelectOrgan('Heart')} 
      />

      {/* LUNGS */}
      <group>
        <LungMesh 
          position={[0.5, 2.2, 0]} 
          isSelected={selectedOrgan === 'Lungs'} 
          isDimmed={selectedOrgan !== null && selectedOrgan !== 'Lungs'}
          onClick={() => onSelectOrgan('Lungs')} 
          side="right"
        />
        <LungMesh 
          position={[-0.5, 2.2, 0]} 
          isSelected={selectedOrgan === 'Lungs'} 
          isDimmed={selectedOrgan !== null && selectedOrgan !== 'Lungs'}
          onClick={() => onSelectOrgan('Lungs')} 
          side="left"
        />
      </group>

      {/* LIVER */}
      <BasicOrganMesh 
        name="Liver"
        position={[0.4, 1.2, 0.1]} 
        color="#b45309" 
        isSelected={selectedOrgan === 'Liver'} 
        isDimmed={selectedOrgan !== null && selectedOrgan !== 'Liver'}
        onClick={() => onSelectOrgan('Liver')} 
      />

      {/* KIDNEYS */}
      <group>
        <BasicOrganMesh 
          name="Kidneys"
          position={[-0.6, 0.8, -0.3]} 
          color="#0d9488" 
          isSelected={selectedOrgan === 'Kidneys'} 
          isDimmed={selectedOrgan !== null && selectedOrgan !== 'Kidneys'}
          onClick={() => onSelectOrgan('Kidneys')} 
        />
        <BasicOrganMesh 
          name="Kidneys"
          position={[0.6, 0.8, -0.3]} 
          color="#0d9488" 
          isSelected={selectedOrgan === 'Kidneys'} 
          isDimmed={selectedOrgan !== null && selectedOrgan !== 'Kidneys'}
          onClick={() => onSelectOrgan('Kidneys')} 
          hideLabel
        />
      </group>

    </group>
  );
}

// ORGANIC HEART
function HeartMesh({ position, isSelected, isDimmed, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    let targetScale = 1;
    if (isSelected) {
      // Realistic "lub-dub" double-beat ECG pulse
      const t = (state.clock.elapsedTime * 1.5) % 1.0; 
      // lub
      let scaleOffset = 0;
      if (t < 0.1) scaleOffset = Math.sin(t * Math.PI * 10) * 0.15;
      // dub
      else if (t > 0.2 && t < 0.35) scaleOffset = Math.sin((t - 0.2) * Math.PI * (1/0.15)) * 0.25;
      
      targetScale = 1.3 + scaleOffset;
    } else if (hovered) {
      targetScale = 1.1;
    }

    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.3);
  });

  const material = new THREE.MeshPhysicalMaterial({
    color: '#991111',
    emissive: '#330000',
    emissiveIntensity: isSelected ? 0.5 : (hovered ? 0.3 : 0.1),
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: isDimmed ? 0.2 : 0.95
  });

  return (
    <group 
      position={position} 
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
    >
      {/* Ventricles */}
      <mesh material={material} position={[0, -0.1, 0]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.25, 32, 32]} />
      </mesh>
      {/* Left Atrium */}
      <mesh material={material} position={[-0.15, 0.15, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
      </mesh>
      {/* Right Atrium */}
      <mesh material={material} position={[0.15, 0.1, 0.1]}>
        <sphereGeometry args={[0.12, 32, 32]} />
      </mesh>
      {/* Aorta Arch */}
      <mesh material={new THREE.MeshPhysicalMaterial({...material, color: '#aa2222'})} position={[0, 0.25, -0.05]} rotation={[0, 0, -0.4]}>
        <torusGeometry args={[0.1, 0.05, 16, 32, Math.PI]} />
      </mesh>

      {(hovered || isSelected) && !isDimmed && (
        <Text position={[0, 0.6, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">Heart</Text>
      )}
    </group>
  );
}

// ORGANIC LUNGS
function LungMesh({ position, side, isSelected, isDimmed, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    let targetScale = 1;
    if (isSelected) {
      // Slow organic breathing
      targetScale = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    } else if (hovered) {
      targetScale = 1.1;
    }
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const material = new THREE.MeshPhysicalMaterial({
    color: '#3b82f6',
    emissive: '#1e3a8a',
    emissiveIntensity: isSelected ? 0.6 : 0.2,
    roughness: 0.6,
    clearcoat: 0.5,
    transparent: true,
    opacity: isDimmed ? 0.2 : 0.85
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
        rotation={[0, 0, side === 'right' ? 0.1 : -0.1]}
      >
        <capsuleGeometry args={[0.2, 0.4, 4, 16]} />
        <mesh material={material} />
      </mesh>
      
      {side === 'left' && (hovered || isSelected) && !isDimmed && (
        <Text position={[0.5, 0.7, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">Lungs</Text>
      )}
    </group>
  );
}

// ORGANIC BRAIN
function BrainMesh({ position, isSelected, isDimmed, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    const targetScale = isSelected ? 1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.05 : (hovered ? 1.1 : 1);
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const material = new THREE.MeshPhysicalMaterial({
    color: '#a855f7',
    emissive: '#581c87',
    emissiveIntensity: isSelected ? 0.8 : 0.3,
    roughness: 0.4,
    clearcoat: 0.6,
    transparent: true,
    opacity: isDimmed ? 0.2 : 0.9
  });

  return (
    <group 
      position={position} 
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
    >
      <mesh material={material} scale={[1, 0.8, 1.1]}>
        <sphereGeometry args={[0.3, 32, 32]} />
      </mesh>
      {/* Subtle brain hemisphere groove */}
      <mesh material={new THREE.MeshBasicMaterial({color: '#2e1065'})} position={[0, 0.02, 0]} scale={[0.02, 0.8, 1.12]}>
        <boxGeometry args={[1, 0.6, 0.6]} />
      </mesh>

      {(hovered || isSelected) && !isDimmed && (
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">Brain</Text>
      )}
    </group>
  );
}

// BASIC ORGAN (Liver/Kidneys)
function BasicOrganMesh({ name, position, color, isSelected, isDimmed, onClick, hideLabel }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const targetScale = isSelected ? 1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.05 : (hovered ? 1.1 : 1);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const material = new THREE.MeshPhysicalMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: isSelected ? 0.6 : 0.2,
    roughness: 0.3,
    clearcoat: 0.8,
    transparent: true,
    opacity: isDimmed ? 0.2 : 0.9
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
        scale={[1, 0.6, 0.8]}
      >
        <sphereGeometry args={[0.25, 32, 32]} />
        <mesh material={material} />
      </mesh>
      
      {!hideLabel && (hovered || isSelected) && !isDimmed && (
        <Text position={[0, 0.4, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">{name}</Text>
      )}
    </group>
  );
}
