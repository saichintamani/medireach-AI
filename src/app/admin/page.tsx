"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Users, AlertTriangle, ShieldCheck, Database, Server, Cpu, Zap, ActivitySquare, BrainCircuit, ScanLine } from "lucide-react";

// Mock data for initial UI render
const RECENT_ALERTS = [
  { id: 1, type: "critical", patient: "JD-4421", issue: "Severe Arrhythmia Detected", time: "2 min ago" },
  { id: 2, type: "warning", patient: "AK-9920", issue: "Elevated Blood Pressure", time: "15 min ago" },
  { id: 3, type: "info", patient: "System", issue: "Neurological Models Updated", time: "1 hr ago" },
];

const ACTIVE_AGENTS = [
  { name: "Emergency Triage", status: "Active", load: 82, color: "text-red-400", bg: "bg-red-400" },
  { name: "Diagnostic Reasoner", status: "Active", load: 45, color: "text-indigo-400", bg: "bg-indigo-400" },
  { name: "Radiology Vision", status: "Idle", load: 12, color: "text-green-400", bg: "bg-green-400" },
  { name: "Patient Chatbot", status: "Active", load: 68, color: "text-blue-400", bg: "bg-blue-400" },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memUsage, setMemUsage] = useState(62);

  useEffect(() => {
    setMounted(true);
    // Simulate dynamic system load
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));
      setMemUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() * 4 - 2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900/80 border-r border-slate-800 p-6 flex flex-col z-20 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-900/50 rounded-xl flex items-center justify-center border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <ShieldCheck className="text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">MediReach</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: ActivitySquare, label: "Command Center", active: true },
            { icon: Users, label: "Patient Roster" },
            { icon: AlertTriangle, label: "Emergencies", badge: "2" },
            { icon: BrainCircuit, label: "AI Agents" },
            { icon: Database, label: "Data Lake" },
          ].map((item, idx) => (
            <button key={idx} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${item.active ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <item.icon size={18} className={item.active ? "text-indigo-400" : ""} />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-red-500/20 border border-red-500/50 text-red-400 py-0.5 px-2 rounded-full text-[10px]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Server size={14} className="text-green-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Server Status</span>
          </div>
          <div className="text-sm text-green-400 font-mono">ALL SYSTEMS NOMINAL</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/0 to-transparent pointer-events-none" />
        
        <header className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h2 className="text-3xl font-black text-white">Global Command</h2>
            <p className="text-slate-400 text-sm">Real-time hospital intelligence & AI orchestrator monitoring.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-700 transition">
              <ScanLine size={16} className="text-cyan-400" /> Full System Scan
            </button>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-8 relative z-10">
          {/* STAT CARDS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={64} />
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Active Patients</h3>
            <div className="text-4xl font-black text-white mb-2">1,204</div>
            <div className="text-xs text-green-400 flex items-center gap-1">+12% vs last week</div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/50 backdrop-blur-md border border-red-900/30 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/50 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle size={64} className="text-red-500" />
            </div>
            <h3 className="text-red-400/80 text-xs font-bold uppercase tracking-widest mb-2">Critical Anomalies</h3>
            <div className="text-4xl font-black text-white mb-2">2</div>
            <div className="text-xs text-red-400 flex items-center gap-1">Requires immediate triage</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={64} className="text-cyan-500" />
            </div>
            <h3 className="text-cyan-400/80 text-xs font-bold uppercase tracking-widest mb-2">AI Diagnostics Run</h3>
            <div className="text-4xl font-black text-white mb-2">8,492</div>
            <div className="text-xs text-cyan-400 flex items-center gap-1">Last 24 hours</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-6 relative z-10">
          {/* AI SYSTEM LOAD */}
          <div className="col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Cpu className="text-indigo-400" size={18} /> Deep Neural Network Status
            </h3>
            
            <div className="space-y-6">
              {ACTIVE_AGENTS.map((agent, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <span className={agent.color}>{agent.name}</span>
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border ${agent.status === 'Active' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-600 text-slate-400 bg-slate-800'}`}>
                        {agent.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{agent.load}% Load</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${agent.load}%` }} 
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${agent.bg} shadow-[0_0_10px_currentColor]`} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Compute (CPU)</div>
                <div className="text-xl font-mono text-white">{cpuUsage.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Memory Matrix</div>
                <div className="text-xl font-mono text-white">{memUsage.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* REAL-TIME ALERTS */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Zap className="text-yellow-400" size={18} /> Live Sentinel Alerts
            </h3>
            
            <div className="flex-1 space-y-3">
              {RECENT_ALERTS.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-xl border ${
                  alert.type === 'critical' ? 'bg-red-950/30 border-red-500/30' :
                  alert.type === 'warning' ? 'bg-orange-950/30 border-orange-500/30' :
                  'bg-blue-950/30 border-blue-500/30'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold ${
                      alert.type === 'critical' ? 'text-red-400' :
                      alert.type === 'warning' ? 'text-orange-400' :
                      'text-blue-400'
                    }`}>
                      {alert.patient}
                    </span>
                    <span className="text-[10px] text-slate-500">{alert.time}</span>
                  </div>
                  <p className="text-sm text-slate-300">{alert.issue}</p>
                </div>
              ))}
            </div>
            
            <button className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg transition-colors">
              View All Logs
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
