"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Zap, HeartPulse, Activity, AlertTriangle, CheckCircle2, Bone, Brain, ArrowRight, MessageSquare, Send, Hospital, UploadCloud, MapPin, AlertOctagon } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, ContactShadows, useGLTF, Text, Center, Bounds } from "@react-three/drei";
import * as THREE from "three";

type AnatomyMode = 'Cardiac' | 'Orthopedic' | 'Neurological';

interface DiagnosisResult {
  score: number;
  disease: string;
  affectedNode: string;
  recommendation: string;
  severity: "low" | "medium" | "high" | "critical";
  explanation?: string;
  consequences?: string;
  action_plan?: string[];
  flaws?: string[];
}

// --------------------------------------------------------
// REALISTIC GLTF LOADERS (Awaiting User Assets)
// --------------------------------------------------------
// The user must place 'heart.glb', 'skeleton.glb', and 'brain.glb' in the /public/models/ directory.

function RealisticCardiac({ isAnalyzed, hasFlaws }: { isAnalyzed: boolean, hasFlaws: boolean }) {
  const { scene } = useGLTF('/models/heart.glb');
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        if (m.material && (m.material as THREE.MeshStandardMaterial).emissive) {
          if (isAnalyzed) {
            (m.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(hasFlaws ? "#ff0000" : "#ff4444");
            (m.material as THREE.MeshStandardMaterial).emissiveIntensity = hasFlaws ? 1.5 : 0.5;
          } else {
            (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
          }
        }
      }
    });
  }, [isAnalyzed, hasFlaws, clonedScene]);

  return (
    <Bounds fit clip margin={1.2}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </Bounds>
  );
}

function RealisticOrthopedic({ isAnalyzed, hasFlaws }: { isAnalyzed: boolean, hasFlaws: boolean }) {
  const { scene } = useGLTF('/models/divide_within_-_medical.glb');
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        if (m.material && (m.material as THREE.MeshStandardMaterial).emissive) {
          if (isAnalyzed) {
            (m.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(hasFlaws ? "#ff2200" : "#ffaa00");
            (m.material as THREE.MeshStandardMaterial).emissiveIntensity = hasFlaws ? 1.5 : 0.5;
          } else {
            (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
          }
        }
      }
    });
  }, [isAnalyzed, hasFlaws, clonedScene]);

  return (
    <Bounds fit clip margin={1.2}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </Bounds>
  );
}

function RealisticNeurological({ isAnalyzed, hasFlaws }: { isAnalyzed: boolean, hasFlaws: boolean }) {
  const { scene } = useGLTF('/models/divide_within_-_medical.glb');
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        if (m.material && (m.material as THREE.MeshStandardMaterial).emissive) {
          if (isAnalyzed) {
            (m.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(hasFlaws ? "#ff00ff" : "#aa44ff");
            (m.material as THREE.MeshStandardMaterial).emissiveIntensity = hasFlaws ? 1.5 : 0.5;
          } else {
            (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
          }
        }
      }
    });
  }, [isAnalyzed, hasFlaws, clonedScene]);

  return (
    <Bounds fit clip margin={1.2}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </Bounds>
  );
}

useGLTF.preload('/models/heart.glb');
useGLTF.preload('/models/divide_within_-_medical.glb');

// Global toggle for Realistic vs Procedural
const USE_REALISTIC_MODELS = true;

function NativeAnatomyEngine({ mode, isAnalyzed, hasFlaws }: { mode: AnatomyMode, isAnalyzed: boolean, hasFlaws: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += hasFlaws ? 0.015 : 0.005; // Spin faster if emergency
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={hasFlaws ? 4 : 2} rotationIntensity={0.5} floatIntensity={1}>
        <Suspense fallback={<Text color="white">Loading 3D Asset...</Text>}>
          {mode === 'Cardiac' && <RealisticCardiac isAnalyzed={isAnalyzed} hasFlaws={hasFlaws} />}
          {mode === 'Orthopedic' && <RealisticOrthopedic isAnalyzed={isAnalyzed} hasFlaws={hasFlaws} />}
          {mode === 'Neurological' && <RealisticNeurological isAnalyzed={isAnalyzed} hasFlaws={hasFlaws} />}
        </Suspense>
      </Float>
    </group>
  );
}


// --------------------------------------------------------
// HOSPITAL CHATBOT COMPONENT (WITH GEOLOCATION)
// --------------------------------------------------------

function HospitalChatbot({ diagnosis, locationCoords }: { diagnosis: DiagnosisResult | null, locationCoords: {lat: number, lng: number} | null }) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-initialize chatbot with geolocation
  useEffect(() => {
    if (diagnosis && !initialized) {
      setInitialized(true);
      const initChat = async () => {
        setIsTyping(true);
        let initMsg = `Hello. I have reviewed your ${diagnosis.disease} diagnosis.`;
        if (locationCoords) {
          initMsg += ` I am automatically fetching specialized hospitals near your current GPS location...`;
          setMessages([{ role: 'ai', content: initMsg }]);
          
          try {
            const res = await fetch('/api/hospital-chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: "Please recommend hospitals based on my GPS coordinates.",
                diagnosis: diagnosis,
                history: [],
                locationCoordinates: locationCoords
              })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
          } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', content: "Error communicating with hospital database." }]);
          }
        } else {
          initMsg += ` Please provide your city or zip code so I can recommend nearby hospitals.`;
          setMessages([{ role: 'ai', content: initMsg }]);
        }
        setIsTyping(false);
      };
      initChat();
    }
  }, [diagnosis, locationCoords, initialized]);

  const sendMessage = async () => {
    if(!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/hospital-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          diagnosis: diagnosis,
          history: messages,
          locationCoordinates: locationCoords
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: "Error communicating with hospital database." }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="mt-8 bg-slate-950/50 border border-indigo-500/30 rounded-2xl flex flex-col h-[350px] overflow-hidden flex-shrink-0">
      <div className="bg-indigo-900/40 p-3 border-b border-indigo-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hospital size={16} className="text-indigo-400" />
          <span className="text-indigo-100 font-bold text-xs uppercase tracking-widest">MediReach Emergency Agent</span>
        </div>
        {locationCoords && (
          <div className="flex items-center gap-1 text-[10px] text-green-400 bg-green-900/30 px-2 py-1 rounded-full border border-green-500/30">
            <MapPin size={10} />
            GPS Active
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-indigo-100 rounded-bl-none border border-slate-700'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-indigo-100 rounded-2xl rounded-bl-none p-3 text-xs flex gap-1 items-center">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"/>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"/>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"/>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask for hospitals or details..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button onClick={sendMessage} className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center text-white transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}


// --------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// --------------------------------------------------------

export default function InteractiveAnatomyIntelligence() {
  const [activeMode, setActiveMode] = useState<AnatomyMode>('Cardiac');
  const [uploadState, setUploadState] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TRUE AI FILE UPLOAD
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState('analyzing');
    
    // UI Loading sequence while awaiting real API
    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => prev < 4 ? prev + 1 : prev);
    }, 1500);

    try {
      // 1. Ask for Geolocation in parallel
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.warn("Geolocation denied or failed:", error);
          }
        );
      }

      // 2. Send to Deep AI
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", activeMode);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      
      clearInterval(stepInterval);
      setAnalysisStep(4);
      setDiagnosis(json.data);
      setUploadState('complete');

    } catch(err) {
      console.error(err);
      clearInterval(stepInterval);
      setUploadState('idle');
      alert("Failed to process report.");
    }
  };

  const resetSystem = () => {
    setUploadState('idle');
    setAnalysisStep(0);
    setDiagnosis(null);
    setLocationCoords(null);
  };

  const getModeIcon = () => {
    switch(activeMode) {
      case 'Cardiac': return <HeartPulse className="text-red-400" size={24} />;
      case 'Orthopedic': return <Bone className="text-orange-400" size={24} />;
      case 'Neurological': return <Brain className="text-purple-400" size={24} />;
    }
  };

  const hasFlaws = !!diagnosis?.flaws && diagnosis.flaws.length > 0;

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans">
      
      {/* LEFT PANEL: Real Report Upload & Chatbot */}
      <div className="w-[500px] bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800 p-8 flex flex-col z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="mb-6 flex-shrink-0 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.png" alt="MediReach Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-tighter">
                MediReach AI
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Deep Intelligence OS</p>
          </div>
          <a href="/twin" className="px-4 py-2 bg-indigo-900/40 border border-indigo-500/50 rounded-xl text-indigo-300 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2">
            <Activity size={14} /> Digital Twin
          </a>
        </div>

        {/* Dynamic State Area */}
        <AnimatePresence mode="wait">
          
          {/* STATE 1: IDLE / REAL UPLOAD */}
          {uploadState === 'idle' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8 flex-shrink-0">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Select System Target</h3>
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
                <UploadCloud className="text-indigo-400" size={20} /> Upload Actual Report
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Upload your true medical PDF or Image. Gemini AI will deeply evaluate it in real-time.
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                className="hidden" 
                accept="image/*,application/pdf"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-[200px] border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl bg-slate-800/30 hover:bg-indigo-950/20 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-16 h-16 bg-slate-800 group-hover:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 transition-colors">
                  <FileUp className="text-slate-400 group-hover:text-indigo-400" size={28} />
                </div>
                <p className="text-slate-300 font-bold mb-1">Select File to Evaluate</p>
                <div className="mt-6 px-6 py-2 bg-indigo-600/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  Initialize Deep AI
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 2: ANALYZING (REAL WAIT) */}
          {uploadState === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-indigo-500/30 overflow-hidden flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex-shrink-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,1)] scanner-line" />
                <div className="relative z-10 flex flex-col items-center">
                  <Zap className="text-indigo-400 mb-2 animate-pulse" size={32} />
                  <span className="text-indigo-300 font-bold tracking-widest text-sm uppercase text-center px-4">Deep Scanning Medical Document...<br/>Requesting GPS Location...</span>
                </div>
              </div>

              <div className="space-y-4">
                <AnalysisStep label="Parsing Deep Anatomical Metrics..." active={analysisStep >= 0} completed={analysisStep > 0} />
                <AnalysisStep label="Evaluating Flaws & Emergencies..." active={analysisStep >= 1} completed={analysisStep > 1} />
                <AnalysisStep label="Generating Action Plan..." active={analysisStep >= 2} completed={analysisStep > 2} />
                <AnalysisStep label="Retrieving GLTF Object Mappings..." active={analysisStep >= 3} completed={analysisStep > 3} />
              </div>
            </motion.div>
          )}

          {/* STATE 3: COMPLETE (TRUE REPORT & CHATBOT) */}
          {uploadState === 'complete' && diagnosis && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col pb-4"
            >
              <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 mb-4 flex-shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center border border-indigo-500">
                    {getModeIcon()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">{activeMode} Health Score</h3>
                    <p className="text-indigo-400 text-[10px] font-mono uppercase tracking-widest">Deep AI Evaluation</p>
                  </div>
                  <div className={`ml-auto text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br ${diagnosis.severity === 'critical' || hasFlaws ? 'from-red-500 to-red-800' : 'from-yellow-400 to-orange-500'}`}>
                    {diagnosis.score}
                  </div>
                </div>
              </div>

              {/* DEEP ANALYSIS PANEL */}
              <div className="space-y-3 mb-2 flex-shrink-0">
                
                {hasFlaws && (
                  <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertOctagon className="text-red-500" size={16} />
                      <h4 className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Critical Flaws Detected</h4>
                    </div>
                    <ul className="text-red-200 text-sm list-disc ml-5 space-y-1">
                      {diagnosis.flaws?.map((flaw, i) => <li key={i}>{flaw}</li>)}
                    </ul>
                    <p className="text-xs text-red-400 mt-2 italic font-semibold">→ 3D Model glowing red for emergency localization.</p>
                  </div>
                )}

                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Evaluated Disease</h4>
                  <p className="text-white font-bold mb-3">{diagnosis.disease}</p>
                  
                  <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Detailed Explanation</h4>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">{diagnosis.explanation || "No deep explanation available."}</p>
                  
                  <h4 className="text-orange-400 font-bold text-[10px] uppercase tracking-widest mb-1">Consequences if Ignored</h4>
                  <p className="text-orange-200 text-sm leading-relaxed mb-3">{diagnosis.consequences || "Unknown."}</p>
                  
                  <h4 className="text-green-400 font-bold text-[10px] uppercase tracking-widest mb-1">Immediate Action Plan</h4>
                  <ul className="text-green-100 text-sm list-decimal ml-5 space-y-1">
                    {diagnosis.action_plan?.map((action, i) => <li key={i}>{action}</li>)}
                  </ul>
                </div>
              </div>

              {/* HOSPITAL CHATBOT */}
              <HospitalChatbot diagnosis={diagnosis} locationCoords={locationCoords} />

              <button 
                onClick={resetSystem}
                className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-700 text-sm flex-shrink-0"
              >
                Evaluate New Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* CENTER PANEL: REALISTIC 3D ANATOMY ENGINE */}
      <div className="flex-1 relative bg-black flex flex-col cursor-move">
        <div className="absolute top-6 left-6 z-10 flex items-center gap-4 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full animate-pulse ${hasFlaws ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">True GLTF Native Engine</span>
          </div>
          {hasFlaws && (
            <div className="bg-red-900/60 backdrop-blur-md border border-red-500/50 px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertTriangle className="text-red-400" size={14} />
              <span className="text-red-300 font-bold text-xs uppercase tracking-widest">Emergency Mode Active</span>
            </div>
          )}
        </div>

        <div className="flex-1 w-full h-full relative">
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <color attach="background" args={["#020617"]} />
            <ambientLight intensity={hasFlaws ? 0.2 : 0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={hasFlaws ? 1.5 : 0.5} color={hasFlaws ? "red" : "white"} />
            
            <NativeAnatomyEngine mode={activeMode} isAnalyzed={uploadState === 'complete'} hasFlaws={hasFlaws} />
            
            <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
            <OrbitControls enablePan={false} />
            <Environment preset={hasFlaws ? "night" : "city"} />
          </Canvas>
        </div>
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
