"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { DigitalTwinMesh } from "@/components/dashboard/DigitalTwinMesh";
import { Activity, Brain, HeartPulse, ShieldAlert, ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function DigitalTwinDashboard() {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

  // Simulated metrics based on organ
  const getOrganMetrics = () => {
    switch (selectedOrgan) {
      case "Heart":
        return {
          status: "Warning",
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          icon: <HeartPulse className="text-red-400" size={24} />,
          stats: [
            { label: "BPM", value: "105", normal: "60-100" },
            { label: "Blood Pressure", value: "140/90", normal: "120/80" },
            { label: "Arrhythmia Risk", value: "High", normal: "Low" }
          ],
          diagnosis: "Tachycardia & Elevated BP detected. High risk of cardiovascular event. Immediate consultation advised."
        };
      case "Brain":
        return {
          status: "Optimal",
          color: "text-purple-400",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/30",
          icon: <Brain className="text-purple-400" size={24} />,
          stats: [
            { label: "Neural Activity", value: "98%", normal: ">95%" },
            { label: "Cerebral Blood Flow", value: "50 ml", normal: "45-50 ml" },
            { label: "Cognitive Stress", value: "Low", normal: "Low" }
          ],
          diagnosis: "All neurological parameters within normal limits. No immediate action required."
        };
      case "Lungs":
        return {
          status: "Sub-Optimal",
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          icon: <Activity className="text-blue-400" size={24} />,
          stats: [
            { label: "SpO2", value: "94%", normal: ">95%" },
            { label: "Respiratory Rate", value: "22/min", normal: "12-20" },
            { label: "Airway Resistance", value: "Moderate", normal: "Low" }
          ],
          diagnosis: "Mild hypoxia and elevated respiratory rate detected. Potential early-stage respiratory distress."
        };
      default:
        return {
          status: "Stable",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          icon: <Activity className="text-emerald-400" size={24} />,
          stats: [
            { label: "Integrity", value: "99%", normal: ">90%" },
            { label: "Function", value: "Normal", normal: "Normal" }
          ],
          diagnosis: "Organ functioning correctly with no detected anomalies."
        };
    }
  };

  const metrics = selectedOrgan ? getOrganMetrics() : null;

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans relative">
      
      {/* Top Navigation Overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
        <Link href="/" className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300">
          <ArrowLeft size={20} />
        </Link>
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
          <ShieldAlert className="text-indigo-400" size={16} />
          <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">Digital Twin Active</span>
        </div>
        {!selectedOrgan && (
          <div className="bg-indigo-900/40 backdrop-blur-md border border-indigo-500/30 px-4 py-2 rounded-lg text-indigo-300 text-xs font-bold uppercase tracking-widest animate-pulse">
            Select an organ to isolate
          </div>
        )}
      </div>

      {/* 3D Canvas Context */}
      <div className="flex-1 w-full h-full relative z-0">
        <Canvas camera={{ position: [0, 1, 8], fov: 45 }}>
          <color attach="background" args={["#020617"]} />
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <DigitalTwinMesh 
            onSelectOrgan={(organ) => setSelectedOrgan(organ === selectedOrgan ? null : organ)} 
            selectedOrgan={selectedOrgan} 
          />
          
          <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} far={4} />
          <OrbitControls enablePan={false} enableZoom={true} maxDistance={10} minDistance={2} />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Side Overlay Panel for Organ Dashboard */}
      <AnimatePresence>
        {selectedOrgan && metrics && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 w-[400px] h-full bg-slate-900/90 backdrop-blur-xl border-l border-slate-800 p-8 z-20 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${metrics.borderColor} ${metrics.bgColor}`}>
                  {metrics.icon}
                </div>
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">{selectedOrgan}</h2>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${metrics.color}`}>
                    Status: {metrics.status}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrgan(null)}
                className="text-slate-500 hover:text-white transition-colors p-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Metrics List */}
            <div className="space-y-4 mb-8">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Live Parameters</h3>
              {metrics.stats.map((stat, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-slate-300 text-sm">{stat.label}</span>
                  <div className="text-right">
                    <div className="text-white font-bold">{stat.value}</div>
                    <div className="text-slate-500 text-[10px]">Normal: {stat.normal}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Diagnosis / Notes */}
            <div className="flex-1">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">AI Diagnostic Notes</h3>
              <div className={`p-4 rounded-xl border ${metrics.borderColor} ${metrics.bgColor}`}>
                <p className={`text-sm leading-relaxed ${metrics.status === 'Stable' || metrics.status === 'Optimal' ? 'text-slate-300' : 'text-slate-200'}`}>
                  {metrics.diagnosis}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                Run Deep Scan
              </button>
              <button 
                onClick={() => setSelectedOrgan(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors text-sm border border-slate-700"
              >
                Return to Full Body
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
