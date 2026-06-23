"use client";

import { useState, useRef } from "react";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from "framer-motion";
import { DigitalTwinMesh } from "@/components/dashboard/DigitalTwinMesh";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { ShaderVariant } from "@/components/ui/webgl-shader";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { Home, Activity, FileText, Bell, User, Settings, Zap, Camera, MapPin, TriangleAlert, ShieldAlert } from "lucide-react";
import * as THREE from 'three';

export default function AppPage() {
  return (
    <div className="flex flex-col bg-[#020617] min-h-screen overflow-x-hidden">
      <HeroScrollSection />
      <DashboardSection />
    </div>
  );
}

function HeroScrollSection() {
  return (
    <div className="flex flex-col overflow-hidden pb-[100px] pt-[50px] relative">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/20 blur-[150px] rounded-full pointer-events-none" />

      <ContainerScroll
        titleComponent={
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src="/logo.png" alt="MediReach AI Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              <h1 className="text-5xl md:text-[5rem] font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-tighter leading-none">
                MediReach AI
              </h1>
            </div>
            <h2 className="text-2xl md:text-4xl font-medium text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Welcome to the ultimate Healthcare Intelligence OS. <br />
              <span className="text-cyan-400 font-bold mt-2 inline-block">
                Virtual Diagnosis & Advanced Patient Digital Twins.
              </span>
            </h2>
          </div>
        }
      >
        <div className="w-full h-full relative bg-[#050510]">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#ef4444" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#818cf8" />
            <Stars radius={50} depth={20} count={2000} factor={4} saturation={0.5} fade />
            <GiantHeartMesh />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
          </Canvas>
          
          <div className="absolute bottom-6 left-6 text-slate-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            System Online - Vitals Nominal
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}

function GiantHeartMesh() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Fleshy, visceral material for human heart realism
  const material = new THREE.MeshStandardMaterial({
    color: '#3a0000', // Deep blood red
    emissive: '#110000',
    roughness: 0.8,
    metalness: 0.1,
    bumpScale: 0.05,
  });

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Visceral, fluid blood-pumping movement
    const t = (state.clock.elapsedTime * 1.5) % 1.0; 
    let scaleOffset = 0;
    
    // Strong primary pump (Systole)
    if (t < 0.15) scaleOffset = Math.sin(t * Math.PI * (1/0.15)) * 0.12;
    // Secondary pump (Diastole bounce)
    else if (t > 0.25 && t < 0.45) scaleOffset = Math.sin((t - 0.25) * Math.PI * (1/0.2)) * 0.18;
    
    const targetScale = 1.8 + scaleOffset;
    
    // Organic wobble (to make it look like a real muscle contracting, not just scaling uniformly)
    const wobbleX = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    const wobbleY = Math.cos(state.clock.elapsedTime * 3) * 0.02;

    groupRef.current.scale.lerp(new THREE.Vector3(targetScale + wobbleX, targetScale + wobbleY, targetScale), 0.2);
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Ventricles */}
      <mesh material={material} position={[0, -0.1, 0]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.8, 64, 64]} />
      </mesh>
      {/* Left Atrium */}
      <mesh material={material} position={[-0.4, 0.4, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
      </mesh>
      {/* Right Atrium */}
      <mesh material={material} position={[0.4, 0.3, 0.3]}>
        <sphereGeometry args={[0.35, 32, 32]} />
      </mesh>
      {/* Aorta Arch */}
      <mesh material={new THREE.MeshStandardMaterial({...material, color: '#5a0000'})} position={[0, 0.7, -0.1]} rotation={[0, 0, -0.4]}>
        <torusGeometry args={[0.3, 0.15, 32, 64, Math.PI]} />
      </mesh>
    </group>
  );
}


function DashboardSection() {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [agentInput, setAgentInput] = useState("");
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState<any>(null);
  
  // OS Role Toggle
  const [role, setRole] = useState<'Patient' | 'Doctor'>('Patient');
  
  // SOS State
  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  
  // Timeline State
  const [show3DTimeline, setShow3DTimeline] = useState(false);

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);

  // Emergency Modal State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyStep, setEmergencyStep] = useState(0);

  // Trigger SOS Workflow
  const triggerSOS = () => {
    setSosActive(true);
    setShowEmergencyModal(true);
    setEmergencyStep(1); // Detecting Location
    setTimeout(() => {
      setEmergencyStep(2); // Location Locked
      setTimeout(() => {
        setEmergencyStep(3); // Hospitals Found
      }, 1500);
    }, 2000);
  };

  const handleTabChange = (index: number | null) => {
    if (index === 3) setShow3DTimeline(true);
    if (index === 4) triggerSOS();
  };

  const startReportScan = () => {
    setShowScanner(true);
    setIsScanningActive(true);
    setTimeout(() => {
      setIsScanningActive(false);
      setTimeout(() => {
        setShowScanner(false);
        setAgentInput("I just uploaded a Blood Test report. Please analyze my elevated WBC count.");
      }, 1000);
    }, 3000);
  };

  const medicalTimelineData = [
    {
      id: 1,
      title: "Baseline Vitals",
      date: "Jan 12, 2024",
      content: "Routine annual physical. All vitals within normal parameters. Patient advised to maintain current diet.",
      category: "Checkup",
      icon: Activity,
      relatedIds: [2],
      status: "completed" as const,
      energy: 100,
      reportType: "General Physical",
    },
    {
      id: 2,
      title: "Elevated BP Alert",
      date: "Feb 28, 2024",
      content: "Wearable device detected sustained elevated blood pressure (145/95). Warning issued.",
      category: "Alert",
      icon: Bell,
      relatedIds: [1, 3],
      status: "pending" as const,
      energy: 80,
      reportType: "ECG Reading",
      imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Acute Chest Pain",
      date: "Mar 15, 2024",
      content: "Patient reported acute chest pain radiating to left arm. ER visit required.",
      category: "Emergency",
      icon: Activity,
      relatedIds: [2, 4],
      status: "in-progress" as const,
      energy: 95,
      reportType: "Cardiac MRI",
      imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Medication Adjustment",
      date: "Apr 02, 2024",
      content: "Prescription updated. Beta-blockers added. Patient responding well to new regimen.",
      category: "Treatment",
      icon: FileText,
      relatedIds: [3],
      status: "completed" as const,
      energy: 40,
      reportType: "Prescription",
    },
  ];

  const patientData = {
    name: "Arjun Sharma",
    healthScore: 87,
    riskLevel: "Low",
    bloodPressure: "120/80",
    heartRate: "72 bpm",
    sleepQuality: "Good",
  };

  const organData: Record<string, any> = {
    Heart: { score: 85, status: "Normal", trend: "Stable", insights: "Your heart rate variability is optimal. Keep maintaining your cardio routine." },
    Brain: { score: 92, status: "Excellent", trend: "Improving", insights: "Sleep quality has improved cognitive recovery by 15% this week." },
    Lungs: { score: 88, status: "Normal", trend: "Stable", insights: "O2 Saturation is at 98%. No respiratory anomalies detected." },
    Liver: { score: 78, status: "Moderate", trend: "Declining", insights: "Slightly elevated enzymes. Suggest increasing hydration and reducing alcohol." },
    Kidneys: { score: 90, status: "Normal", trend: "Stable", insights: "Hydration levels are excellent. Renal function is optimal." }
  };

  const predictiveRisk = [
    { timeline: "30 Days", risk: "Diabetes Risk: +2%", color: "text-yellow-400" },
    { timeline: "90 Days", risk: "Hypertension Risk: +5%", color: "text-orange-400" },
    { timeline: "180 Days", risk: "Stroke Risk: -10% (Improving)", color: "text-green-400" }
  ];

  const handleSymptomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim()) return;
    setIsAgentLoading(true);
    
    try {
      const res = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: agentInput })
      });
      const data = await res.json();
      setAgentResponse(data);
    } catch {
      setAgentResponse({ riskLevel: "Error", reasoning: "Failed to connect to Health OS." });
    }
    setIsAgentLoading(false);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden relative border-t-2 border-indigo-500/30">
      
      {/* FLOATING NAVIGATION MOVED HERE FOR STATE ACCESS */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
        <ExpandableTabs 
          onChange={handleTabChange}
          tabs={[
            { title: "Dashboard", icon: Home },
            { title: "Vitals", icon: Activity },
            { type: "separator" },
            { title: "Reports", icon: FileText },
            { title: "Alerts", icon: Bell },
            { type: "separator" },
            { title: "Profile", icon: User },
            { title: "Settings", icon: Settings },
          ]} 
          activeColor="text-indigo-400"
        />
      </div>

      {/* OS ROLE TOGGLE */}
      <div className="absolute top-20 left-4 z-40 flex bg-slate-900 rounded-full border border-slate-700 p-1">
        <button 
          onClick={() => setRole('Patient')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'Patient' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Patient View
        </button>
        <button 
          onClick={() => setRole('Doctor')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'Doctor' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Doctor Portal
        </button>
      </div>

      {/* LEFT PANEL: Overview */}
      <div className="w-1/4 p-6 pt-32 border-r border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl flex flex-col z-10 shadow-2xl overflow-y-auto custom-scrollbar">
        
        {role === 'Patient' ? (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="MediReach AI Logo" className="w-12 h-12 object-contain" />
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tighter">
                  MediReach AI X
                </h1>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">Health Digital Twin</p>
              <h2 className="text-2xl font-bold text-white mb-1">{patientData.name}</h2>
              <div className="flex gap-2">
                <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded font-mono">Score: {patientData.healthScore}</span>
                <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-0.5 rounded font-mono">Risk: {patientData.riskLevel}</span>
              </div>
            </div>

            {/* Predictive AI Forecasting */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 mb-6">
              <p className="text-xs text-indigo-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Predictive Risk AI
              </p>
              <div className="space-y-3">
                {predictiveRisk.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-800/40 p-2 rounded-lg border border-slate-700/30">
                    <span className="text-xs text-slate-400">{p.timeline}</span>
                    <span className={`text-xs font-bold ${p.color}`}>{p.risk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Health Timeline */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 mb-6 relative overflow-hidden">
              <div className="absolute left-6 top-10 bottom-4 w-px bg-slate-700" />
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">Dynamic Timeline</p>
              
              <div className="space-y-4 relative z-10 mb-6">
                <TimelineItem month="Jan" status="Normal" desc="All vitals stable" />
                <TimelineItem month="Feb" status="Elevated BP" desc="145/95 detected via wearables" color="border-yellow-500" dotColor="bg-yellow-500" />
                <TimelineItem month="Mar" status="Chest Pain" desc="Reported via Symptom Agent" color="border-red-500" dotColor="bg-red-500" />
                <TimelineItem month="Apr" status="Stable" desc="Medication adjusted" />
              </div>
              
              <button 
                onClick={() => setShow3DTimeline(true)}
                className="w-full relative z-10 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-600 hover:to-purple-600 text-indigo-200 hover:text-white transition-all py-3 rounded-lg border border-indigo-500/30 font-bold tracking-widest uppercase text-[10px] shadow-[0_0_15px_rgba(99,102,241,0.2)]"
              >
                <Zap size={14} /> Launch 3D Orbital Timeline
              </button>
            </div>
          </>
        ) : (
          /* DOCTOR COMMAND CENTER */
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-teal-400 mb-6">Doctor Command Center</h2>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-teal-900/50 mb-4">
              <h3 className="text-sm font-bold text-white mb-2">Patient Overview</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Arjun Sharma presents with a history of elevated BP in February and acute chest pain in March. Current trajectory indicates stabilization due to medication adherence.
              </p>
              <button className="w-full bg-teal-900/50 text-teal-300 text-xs font-bold py-2 rounded border border-teal-700/50">
                View Latest Medical Reports
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-red-900/20 p-3 rounded-lg border border-red-900/30">
                <p className="text-[10px] text-red-400 font-bold uppercase">Critical Alert</p>
                <p className="text-xs text-white mt-1">Arrhythmia Risk +15%</p>
              </div>
              <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
                <p className="text-[10px] text-blue-400 font-bold uppercase">AI Finding</p>
                <p className="text-xs text-white mt-1">Sleep apnea correlation</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CENTER: 3D Personal Health Twin */}
      <div className="flex-1 relative">
        <div className="absolute top-20 right-1/2 translate-x-1/2 z-10 bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-700 pointer-events-none">
          <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-widest">
            MOTION-BASED VISUALIZATION LAYER
          </p>
        </div>

        <Canvas camera={{ position: [0, 1, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
          <Stars radius={100} depth={50} count={3000} factor={3} saturation={0.5} fade />
          <DigitalTwinMesh onSelectOrgan={setSelectedOrgan} selectedOrgan={selectedOrgan} />
        </Canvas>

        {/* SOS BUTTON */}
        <button 
          onClick={triggerSOS}
          className="absolute top-20 right-6 z-20 w-16 h-16 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center font-black text-xl shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse"
        >
          SOS
        </button>

        {/* Organ Inspector Panel */}
        <AnimatePresence>
          {selectedOrgan && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute right-6 top-40 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 uppercase tracking-wider">{selectedOrgan} Intelligence</h3>
                <button onClick={() => setSelectedOrgan(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">Status</span>
                  <span className="font-bold text-white text-sm">{organData[selectedOrgan].status}</span>
                </div>
                
                <div className="mt-4">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">Medical Reasoning Engine</p>
                  <p className="text-sm text-slate-300 leading-relaxed bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/50 shadow-inner">
                    {organData[selectedOrgan].insights}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT PANEL: Agentic AI Chat */}
      <div className="w-1/4 p-4 pt-20 border-l border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl flex flex-col z-10 shadow-2xl">
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900/80 rounded-2xl border border-slate-700/50 p-4 shadow-inner">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Symptom Intelligence Engine
          </p>
          
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
            {agentResponse && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-900/50">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-indigo-900/50">
                  <span className="font-bold text-indigo-300 text-sm">Diagnostic Graph</span>
                  <span className={`text-[10px] px-2 py-1 rounded font-black tracking-widest uppercase ${
                    agentResponse.riskLevel === 'Low' ? 'bg-green-900/50 text-green-400' :
                    agentResponse.riskLevel === 'Moderate' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {agentResponse.riskLevel} RISK
                  </span>
                </div>
                
                <div className="mb-3">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block mb-1">Evidence & Reasoning:</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{agentResponse.reasoning}</p>
                </div>
                
                {agentResponse.potentialCauses?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-slate-500 font-mono text-[10px] uppercase block mb-1">Predicted Pathways:</span>
                    <div className="flex flex-wrap gap-1">
                      {agentResponse.potentialCauses.map((c: string, i: number) => (
                        <span key={i} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-md border border-slate-700">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Camera Scanner Button */}
          <div className="mb-3 px-1">
            <button 
              onClick={startReportScan}
              className="w-full bg-slate-800 hover:bg-indigo-900/50 border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Camera size={14} /> Scan Medical Report via Camera
            </button>
          </div>

          <form onSubmit={handleSymptomQuery} className="relative mt-auto">
            <textarea 
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              disabled={isAgentLoading}
              placeholder="E.g., I have chest pain and dizziness..."
              className="w-full bg-black/40 text-sm text-white rounded-xl p-3 pr-10 border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors resize-none h-20 custom-scrollbar"
            />
            <button type="submit" disabled={isAgentLoading} className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
        </div>
      </div>
      
      {/* 3D RADIAL ORBITAL TIMELINE MODAL */}
      <AnimatePresence>
        {show3DTimeline && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <button 
              onClick={() => setShow3DTimeline(false)}
              className="absolute top-6 right-8 z-[110] flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-full backdrop-blur-md border border-white/20 transition-all shadow-xl font-bold uppercase tracking-widest text-xs"
            >
              ✕ Exit 3D Timeline
            </button>
            <RadialOrbitalTimeline timelineData={medicalTimelineData} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* REPORT SCANNER MODAL */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="relative w-full max-w-2xl h-[80vh] border border-slate-700 bg-black rounded-3xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                  <Camera size={14} /> Diagnostic Vision System
                </div>
                <button onClick={() => setShowScanner(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              
              <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Medical Report Mock" className="w-full h-full object-cover opacity-30 blur-sm" />
                
                {isScanningActive ? (
                  <div className="absolute inset-4 border-2 border-indigo-500/50 rounded-xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,1)] scanner-line" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-indigo-500/30 flex items-center gap-3">
                      <Zap size={16} className="text-indigo-400 animate-pulse" />
                      <span className="text-indigo-300 font-bold tracking-widest text-sm uppercase">Extracting Biomarkers...</span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-green-900/20 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/50">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-green-400 font-bold tracking-widest uppercase text-xl">Scan Complete</span>
                    <span className="text-green-300/70 text-sm mt-2">Feeding into Intelligence Engine</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EMERGENCY PROTOCOL MODAL */}
      <AnimatePresence>
        {showEmergencyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-red-950/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent pointer-events-none" />
            
            <div className="w-full max-w-4xl bg-black/80 border border-red-500/50 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)] relative z-10 flex flex-col">
              
              <div className="bg-red-900/40 border-b border-red-500/30 p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <ShieldAlert className="text-red-500 animate-pulse" size={32} />
                  <div>
                    <h2 className="text-2xl font-black text-red-500 tracking-widest uppercase">Emergency Protocol Activated</h2>
                    <p className="text-red-400/80 text-xs font-mono uppercase">System Override Level 1</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowEmergencyModal(false); setSosActive(false); }}
                  className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/30 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Abort Protocol
                </button>
              </div>

              <div className="p-8 flex gap-8">
                {/* GEOLOCATION SIMULATOR */}
                <div className="flex-1 border border-red-500/20 rounded-2xl bg-black/50 p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                  {emergencyStep === 1 && (
                    <div className="text-center">
                      <MapPin size={48} className="text-red-500/50 animate-bounce mx-auto mb-4" />
                      <div className="text-red-400 font-bold uppercase tracking-widest mb-2">Acquiring GPS Signal...</div>
                      <div className="w-48 h-1 bg-red-950 rounded-full mx-auto overflow-hidden">
                        <div className="w-1/2 h-full bg-red-500 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {emergencyStep >= 2 && (
                    <div className="w-full h-full relative flex items-center justify-center">
                      {/* Mock Radar Map Background */}
                      <div className="absolute inset-0 rounded-xl opacity-20" style={{ backgroundImage: "radial-gradient(circle, #ff0000 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                      <div className="absolute w-48 h-48 rounded-full border border-red-500/30 animate-ping" />
                      <div className="absolute w-32 h-32 rounded-full border border-red-500/50" />
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_#ef4444] mb-4" />
                        <div className="bg-red-950/80 border border-red-500/50 px-4 py-2 rounded-lg backdrop-blur-md text-center">
                          <p className="text-white font-bold text-sm">Location Locked</p>
                          <p className="text-red-300 text-xs font-mono mt-1">LAT 28.6139 | LNG 77.2090</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* HOSPITAL ROUTING */}
                <div className="w-[350px] flex flex-col justify-center">
                  {emergencyStep < 3 ? (
                    <div className="flex items-center gap-3 text-red-500/50 font-bold uppercase tracking-widest text-sm">
                      <TriangleAlert className="animate-spin-slow" />
                      Scanning Medical Grid...
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <div className="text-red-400 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                        <MapPin size={16} /> Dispatched to Nearest ERs
                      </div>

                      <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold text-lg">Apollo Hospital</h4>
                          <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded font-black tracking-widest">ETA: 4 MIN</span>
                        </div>
                        <p className="text-red-300/70 text-xs">Ambulance dispatched. ER alerted of incoming cardiac patient.</p>
                        <div className="mt-3 flex items-center gap-2 text-red-400 text-xs font-mono">
                          <MapPin size={12} /> Distance: 1.2 KM
                        </div>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 opacity-50 grayscale">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold text-lg">Fortis Hospital</h4>
                          <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-1 rounded font-black tracking-widest">ETA: 12 MIN</span>
                        </div>
                        <p className="text-slate-400/70 text-xs">Secondary option. Backup capacity confirmed.</p>
                        <div className="mt-3 flex items-center gap-2 text-slate-500 text-xs font-mono">
                          <MapPin size={12} /> Distance: 3.4 KM
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function TimelineItem({ month, status, desc, color = "border-slate-700", dotColor = "bg-blue-500" }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 text-right text-xs text-slate-500 font-bold mt-1">{month}</div>
      <div className={`relative flex-1 pl-4 pb-4 border-l-2 ${color}`}>
        <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${dotColor} shadow-[0_0_8px_currentColor]`} />
        <h4 className="text-sm font-bold text-white">{status}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
