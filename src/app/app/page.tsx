"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Zap, HeartPulse, Activity, AlertTriangle, CheckCircle2, Bone, Brain, ArrowRight } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, ContactShadows, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

type AnatomyMode = 'Cardiac' | 'Orthopedic' | 'Neurological';

// --------------------------------------------------------
// NATIVE 3D ANATOMY ENGINE COMPONENTS
// --------------------------------------------------------

function CardiacModel({ isAnalyzed }: { isAnalyzed: boolean }) {
  const arteryRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (isAnalyzed && arteryRef.current) {
      // Pulse the artery intensely when an anomaly is detected
      const scale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.1;
      arteryRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Heart Base (Main Muscle) */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <MeshDistortMaterial color={isAnalyzed ? "#4c1d95" : "#be123c"} distort={0.2} speed={2} roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Coronary Artery (The Affected Node) */}
      <mesh ref={arteryRef} position={[1.5, 1, 1]} castShadow>
        <capsuleGeometry args={[0.3, 1, 16, 16]} />
        <meshStandardMaterial 
          color={isAnalyzed ? "#ef4444" : "#9f1239"} 
          emissive={isAnalyzed ? "#ff0000" : "#000000"} 
          emissiveIntensity={isAnalyzed ? 2 : 0} 
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>
      
      {/* Floating diagnostic label */}
      {isAnalyzed && (
        <mesh position={[2.5, 1.5, 1.5]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}
    </group>
  );
}

function OrthopedicModel({ isAnalyzed }: { isAnalyzed: boolean }) {
  const fractureRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (isAnalyzed && fractureRef.current) {
      fractureRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 8]}>
      {/* Main Bone Shaft */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 3, 32]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 3, 32]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Joint Ends */}
      <mesh castShadow position={[0, 3, 0]}><sphereGeometry args={[0.6, 32, 32]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh castShadow position={[0, -3, 0]}><sphereGeometry args={[0.6, 32, 32]} /><meshStandardMaterial color="#f8fafc" /></mesh>

      {/* The Fracture Point (Affected Node) */}
      <mesh ref={fractureRef} position={[0, 0, 0]}>
        <torusGeometry args={[0.45, 0.1, 16, 32]} />
        <meshStandardMaterial 
          color={isAnalyzed ? "#f97316" : "#cbd5e1"}
          emissive={isAnalyzed ? "#ea580c" : "#000000"}
          emissiveIntensity={isAnalyzed ? 2 : 0}
          wireframe={isAnalyzed}
        />
      </mesh>
    </group>
  );
}

function NeurologicalModel({ isAnalyzed }: { isAnalyzed: boolean }) {
  const anomalyRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* Left Hemisphere */}
      <mesh castShadow receiveShadow position={[-1.1, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <MeshDistortMaterial color="#1e1b4b" distort={0.4} speed={1} roughness={0.5} />
      </mesh>
      
      {/* Right Hemisphere */}
      <mesh castShadow receiveShadow position={[1.1, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <MeshDistortMaterial color="#1e1b4b" distort={0.4} speed={1} roughness={0.5} />
      </mesh>

      {/* Temporal Lobe Anomaly (Affected Node) */}
      <mesh ref={anomalyRef} position={[-2, -0.5, 1]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={isAnalyzed ? "#a855f7" : "#312e81"}
          emissive={isAnalyzed ? "#c084fc" : "#000000"}
          emissiveIntensity={isAnalyzed ? 1.5 : 0}
          wireframe={isAnalyzed}
        />
      </mesh>
    </group>
  );
}

function NativeAnatomyEngine({ mode, isAnalyzed }: { mode: AnatomyMode, isAnalyzed: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  // Auto-rotate the camera to focus on the anomaly when analysis completes
  useFrame((state) => {
    if (groupRef.current && isAnalyzed) {
      // Smoothly rotate to expose the specific affected node to the user
      if (mode === 'Cardiac') {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.PI / 4, 0.02);
      } else if (mode === 'Orthopedic') {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.PI / 8, 0.02);
      } else {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -Math.PI / 4, 0.02);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {mode === 'Cardiac' && <CardiacModel isAnalyzed={isAnalyzed} />}
        {mode === 'Orthopedic' && <OrthopedicModel isAnalyzed={isAnalyzed} />}
        {mode === 'Neurological' && <NeurologicalModel isAnalyzed={isAnalyzed} />}
      </Float>
    </group>
  );
}


// --------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// --------------------------------------------------------

export default function InteractiveAnatomyIntelligence() {
  const [activeMode, setActiveMode] = useState<AnatomyMode>('Cardiac');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [analysisStep, setAnalysisStep] = useState(0);

  // Simulated AI Analysis Sequence
  const handleUpload = () => {
    setUploadState('uploading');
    
    setTimeout(() => {
      setUploadState('analyzing');
      
      setTimeout(() => setAnalysisStep(1), 1500); // Extracting
      setTimeout(() => setAnalysisStep(2), 3000); // Mapping
      setTimeout(() => setAnalysisStep(3), 4500); // Calculating
      
      setTimeout(() => setUploadState('complete'), 6000); // Complete
    }, 1500);
  };

  const resetSystem = () => {
    setUploadState('idle');
    setAnalysisStep(0);
  };

  const getModeIcon = () => {
    switch(activeMode) {
      case 'Cardiac': return <HeartPulse className="text-red-400" size={24} />;
      case 'Orthopedic': return <Bone className="text-orange-400" size={24} />;
      case 'Neurological': return <Brain className="text-purple-400" size={24} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans">
      
      {/* LEFT PANEL: Report Upload & Intelligence Engine */}
      <div className="w-[450px] bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800 p-8 flex flex-col z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.png" alt="MediReach Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-tighter">
              MediReach AI
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Native Interactive 3D Anatomy Engine</p>
        </div>

        {/* Dynamic State Area */}
        <AnimatePresence mode="wait">
          
          {/* STATE 1: IDLE / UPLOAD */}
          {uploadState === 'idle' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col"
            >
              {/* Mode Selection */}
              <div className="mb-8">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Select System Sub-Model</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cardiac', 'Orthopedic', 'Neurological'] as AnatomyMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setActiveMode(mode)}
                      className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${
                        activeMode === mode 
                          ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {mode === 'Cardiac' && <HeartPulse size={20} className={activeMode === mode ? 'text-red-400' : 'text-slate-400'} />}
                      {mode === 'Orthopedic' && <Bone size={20} className={activeMode === mode ? 'text-orange-400' : 'text-slate-400'} />}
                      {mode === 'Neurological' && <Brain size={20} className={activeMode === mode ? 'text-purple-400' : 'text-slate-400'} />}
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${activeMode === mode ? 'text-indigo-300' : 'text-slate-500'}`}>
                        {mode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <FileUp className="text-indigo-400" size={20} /> Upload Diagnostic Report
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Upload your {activeMode === 'Cardiac' ? 'ECG or Echo' : activeMode === 'Orthopedic' ? 'X-Ray or DEXA' : 'MRI or CT'} scan for Medical Vision analysis.
              </p>
              
              <div 
                onClick={handleUpload}
                className="flex-1 min-h-[250px] border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl bg-slate-800/30 hover:bg-indigo-950/20 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-16 h-16 bg-slate-800 group-hover:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 transition-colors">
                  <FileUp className="text-slate-400 group-hover:text-indigo-400" size={28} />
                </div>
                <p className="text-slate-300 font-bold mb-1">Select Report File</p>
                <p className="text-slate-500 text-xs">PDF, JPG, PNG (Max 10MB)</p>
                <div className="mt-8 px-6 py-2 bg-indigo-600/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  Initialize Scanner
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 2: ANALYZING */}
          {(uploadState === 'uploading' || uploadState === 'analyzing') && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-indigo-500/30 overflow-hidden flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] opacity-30 bg-cover bg-center" />
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,1)] scanner-line" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <Zap className="text-indigo-400 mb-2 animate-pulse" size={32} />
                  <span className="text-indigo-300 font-bold tracking-widest text-sm uppercase">Medical Vision Active</span>
                </div>
              </div>

              <div className="space-y-4">
                <AnalysisStep label="Extracting Vitals & Biomarkers..." active={analysisStep >= 0} completed={analysisStep > 0} />
                <AnalysisStep label="Mapping Affected Anatomy Node..." active={analysisStep >= 1} completed={analysisStep > 2} />
                <AnalysisStep label="Highlighting 3D Vector Space..." active={analysisStep >= 2} completed={analysisStep > 3} />
              </div>
            </motion.div>
          )}

          {/* STATE 3: COMPLETE (EXPLANATION PANEL) */}
          {uploadState === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center border border-indigo-500">
                    {getModeIcon()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">{activeMode} Health Score</h3>
                    <p className="text-indigo-400 text-[10px] font-mono uppercase tracking-widest">Calculated via AI</p>
                  </div>
                  <div className="ml-auto text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-500">
                    {activeMode === 'Cardiac' ? '82' : activeMode === 'Orthopedic' ? '65' : '94'}
                  </div>
                </div>
                
                <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: activeMode === 'Cardiac' ? "82%" : activeMode === 'Orthopedic' ? "65%" : "94%" }} 
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full ${
                      activeMode === 'Cardiac' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      activeMode === 'Orthopedic' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                      'bg-gradient-to-r from-teal-400 to-green-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-red-500" size={16} />
                    <h4 className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Anomaly Localized</h4>
                  </div>
                  <ul className="text-slate-300 text-sm space-y-2 ml-6 list-disc marker:text-red-500">
                    {activeMode === 'Cardiac' && (
                      <>
                        <li>Atherosclerosis markers detected in <span className="font-bold text-red-400">Coronary Artery</span>.</li>
                        <li>See 3D visualization: Artery pulsing red due to 85% blockage detected in scan.</li>
                      </>
                    )}
                    {activeMode === 'Orthopedic' && (
                      <>
                        <li>Hairline fracture detected on the <span className="font-bold text-orange-400">Distal Radius Shaft</span>.</li>
                        <li>See 3D visualization: Bone integrity compromised at the orange focal point.</li>
                      </>
                    )}
                    {activeMode === 'Neurological' && (
                      <>
                        <li>Minor fluid hyperintensity in the <span className="font-bold text-purple-400">Left Temporal Lobe</span>.</li>
                        <li>See 3D visualization: Affected node glowing purple in left hemisphere.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="bg-teal-950/20 border border-teal-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="text-teal-500" size={16} />
                    <h4 className="text-teal-400 font-bold text-[10px] uppercase tracking-widest">Recommendation</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {activeMode === 'Cardiac' && "Immediate angioplasty consultation required for the highlighted coronary vessel."}
                    {activeMode === 'Orthopedic' && "Immobilize the radius immediately. Proceed with casting to fuse the highlighted fracture zone."}
                    {activeMode === 'Neurological' && "Neurological pathways are largely stable. Schedule a follow-up MRI in 6 months to monitor the highlighted temporal node."}
                  </p>
                </div>
              </div>

              <button 
                onClick={resetSystem}
                className="mt-auto w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-700 flex items-center justify-center gap-2 text-sm"
              >
                Upload Another Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* CENTER PANEL: NATIVE 3D ANATOMY ENGINE */}
      <div className="flex-1 relative bg-black flex flex-col cursor-move">
        
        {/* Header HUD Overlay */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-4 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">MediReach Native 3D Engine</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2">
            {getModeIcon()}
            <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{activeMode} Subsystem Loaded</span>
          </div>
        </div>

        {/* Native React-Three-Fiber Canvas */}
        <div className="flex-1 w-full h-full relative">
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <color attach="background" args={["#020617"]} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <NativeAnatomyEngine mode={activeMode} isAnalyzed={uploadState === 'complete'} />
            
            <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
            <Environment preset="city" />
          </Canvas>
        </div>
        
        {/* Post-Analysis Focus HUD */}
        <AnimatePresence>
          {uploadState === 'complete' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            >
              <div className="bg-indigo-950/80 backdrop-blur-md border border-indigo-500/50 px-6 py-3 rounded-full flex flex-col items-center gap-1 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <span className="text-indigo-300 font-bold text-sm">Target localized in 3D Space.</span>
                <span className="text-indigo-400 text-[10px] uppercase tracking-widest flex items-center gap-1">Drag to rotate <ArrowRight size={12}/></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// Helper Component for AI Scanning Steps
function AnalysisStep({ label, active, completed }: { label: string, active: boolean, completed: boolean }) {
  return (
    <div className={`flex items-center gap-3 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-30'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${completed ? 'bg-indigo-500' : active ? 'border-2 border-indigo-500 border-t-transparent animate-spin' : 'border border-slate-600'}`}>
        {completed && <CheckCircle2 size={12} className="text-white" />}
      </div>
      <span className={`text-sm ${completed ? 'text-indigo-300' : active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}
