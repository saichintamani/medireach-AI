"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Zap, HeartPulse, Activity, AlertTriangle, CheckCircle2, Bone, Brain, ArrowRight } from "lucide-react";

type AnatomyMode = 'Cardiac' | 'Orthopedic' | 'Neurological';

// Public BioDigital Human Model URLs
// Note: These use standard public paths. If they require authentication, you can replace them with your custom widget IDs.
const BIODIGITAL_MODELS = {
  Cardiac: "https://human.biodigital.com/widget/?m=client/biodigital/beating_heart&ui-info=false&ui-search=false&ui-reset=true&ui-fullscreen=false&ui-nav=true&ui-tools=true&ui-help=false&ui-chapter-list=false&ui-label-list=true&ui-anatomy-descriptions=true&ui-tutorial=false&ui-loader=circle&ui-whiteboard=true&ui-disease-descriptions=true&disable-scroll=false",
  Orthopedic: "https://human.biodigital.com/widget/?m=client/biodigital/skeleton&ui-info=false&ui-search=false&ui-reset=true&ui-fullscreen=false&ui-nav=true&ui-tools=true&ui-help=false&ui-chapter-list=false&ui-label-list=true&ui-anatomy-descriptions=true&ui-tutorial=false&ui-loader=circle&ui-whiteboard=true&ui-disease-descriptions=true&disable-scroll=false",
  Neurological: "https://human.biodigital.com/widget/?m=client/biodigital/brain&ui-info=false&ui-search=false&ui-reset=true&ui-fullscreen=false&ui-nav=true&ui-tools=true&ui-help=false&ui-chapter-list=false&ui-label-list=true&ui-anatomy-descriptions=true&ui-tutorial=false&ui-loader=circle&ui-whiteboard=true&ui-disease-descriptions=true&disable-scroll=false",
};

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
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Research-Grade Interactive Anatomy</p>
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
                <AnalysisStep label="Mapping Abnormalities..." active={analysisStep >= 1} completed={analysisStep > 2} />
                <AnalysisStep label="Calculating Predictive Risk..." active={analysisStep >= 2} completed={analysisStep > 3} />
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
                    <h4 className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Disease Recognition</h4>
                  </div>
                  <ul className="text-slate-300 text-sm space-y-2 ml-6 list-disc marker:text-red-500">
                    {activeMode === 'Cardiac' && (
                      <>
                        <li>Elevated blood pressure indicators (145/95 mmHg)</li>
                        <li>Atherosclerosis markers detected in coronary arteries</li>
                      </>
                    )}
                    {activeMode === 'Orthopedic' && (
                      <>
                        <li>Decreased bone mineral density (T-score: -2.1)</li>
                        <li>Early indicators of Osteopenia</li>
                      </>
                    )}
                    {activeMode === 'Neurological' && (
                      <>
                        <li>No acute intracranial hemorrhage</li>
                        <li>Minor white matter hyperintensities (Age-appropriate)</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="bg-teal-950/20 border border-teal-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="text-teal-500" size={16} />
                    <h4 className="text-teal-400 font-bold text-[10px] uppercase tracking-widest">Symptoms & Recommendation</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {activeMode === 'Cardiac' && "Immediate lifestyle modification advised. Focus on reducing sodium intake. Correlates with reported chest tightness."}
                    {activeMode === 'Orthopedic' && "Increase Calcium and Vitamin D intake. Recommend weight-bearing exercises to halt density degradation."}
                    {activeMode === 'Neurological' && "Neurological pathways are stable. Continue current sleep and hydration regimen."}
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

      {/* CENTER PANEL: BIODIGITAL HUMAN PLATFORM INTEGRATION */}
      <div className="flex-1 relative bg-black flex flex-col">
        
        {/* Header HUD Overlay */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-4 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">BioDigital Human Engine</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-lg">
            <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{activeMode} Subsystem Loaded</span>
          </div>
        </div>

        {/* BioDigital Iframe Wrapper */}
        <div className="flex-1 w-full h-full relative">
          {/* Loading overlay while iframe boots */}
          <div className="absolute inset-0 flex items-center justify-center bg-[#020617] -z-10">
            <div className="w-12 h-12 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          
          <iframe 
            id="biodigital-widget"
            src={BIODIGITAL_MODELS[activeMode]}
            width="100%" 
            height="100%" 
            className="border-0"
            allowFullScreen
            title={`BioDigital Human - ${activeMode}`}
          />
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
              <div className="bg-indigo-950/80 backdrop-blur-md border border-indigo-500/50 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <span className="text-indigo-300 font-bold text-sm">Interact with the 3D model above to explore affected regions.</span>
                <ArrowRight className="text-indigo-400" size={16} />
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
