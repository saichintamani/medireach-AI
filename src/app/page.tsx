"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShaderVariant } from "@/components/ui/webgl-shader";
import { Fingerprint, ScanFace, ChevronDown } from "lucide-react";
import { useScroll, useTransform, motion } from "framer-motion";

export default function Page() {
  const router = useRouter();
  
  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [faceIdStored, setFaceIdStored] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Scroll Animation State
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("medireach_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
    
    const savedFaceId = localStorage.getItem("medireach_face_id");
    if (savedFaceId) {
      setFaceIdStored(true);
    }
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    localStorage.setItem("medireach_email", email);
    router.push("/app");
  };

  const handleBiometric = (registerNew = false) => {
    setIsScanning(true);
    setIsRegistering(registerNew);
    
    if (faceIdStored && !registerNew) {
      setTimeout(() => {
        setIsScanning(false);
        setScanComplete(true);
        setTimeout(() => {
          router.push("/app");
        }, 1000);
      }, 1500);
    } else {
      setTimeout(() => {
        setIsScanning(false);
        setScanComplete(true);
        if (registerNew) {
          localStorage.setItem("medireach_face_id", "true");
          setFaceIdStored(true);
        }
        setTimeout(() => {
          router.push("/app");
        }, 1500);
      }, 3000);
    }
  };

  // Scroll Transforms (Based on Variant 1)
  const scaleDimensions = () => {
    return isMobile ? [0.8, 1] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="relative min-h-[150vh] bg-black overflow-x-hidden" ref={containerRef}>
      
      {/* 1. FIXED FULL-PAGE SHADER BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ShaderVariant colorMode="rgb" speed={0.01} xScale={1.0} yScale={0.5} distortion={0.05} />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90 pointer-events-none" />
      </div>

      {/* 2. SCROLLING CONTAINER (VARIANT 1 ALGORITHM) */}
      <div className="h-[80rem] md:h-[100rem] flex items-start justify-center relative p-2 md:p-20 z-10 pt-24 md:pt-40">
        <div className="w-full relative" style={{ perspective: "1000px" }}>
          
          {/* TITLE & LOGO (Moves UP slightly as you scroll) */}
          <motion.div
            style={{ translateY: translate }}
            className="max-w-5xl mx-auto text-center flex flex-col items-center"
          >
            <img src="/logo.png" alt="MediReach AI Logo" className="w-24 md:w-32 h-24 md:h-32 object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] mb-6" />
            <h1 className="text-4xl md:text-6xl font-semibold text-slate-300">
              Welcome to the <br />
              <span className="text-6xl md:text-[8rem] font-black mt-2 leading-none bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 py-4 block">
                Healthcare OS
              </span>
            </h1>
            
            <div className="flex flex-col items-center mt-20 animate-bounce text-slate-400">
              <span className="text-sm tracking-widest uppercase mb-2 font-bold">Scroll Down to Access Terminal</span>
              <ChevronDown size={32} />
            </div>
          </motion.div>

          {/* 3D ROTATING LOGIN PORTAL */}
          <motion.div
            style={{
              rotateX: rotate,
              scale,
              boxShadow:
                "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            }}
            className="max-w-lg mt-[40vh] mx-auto w-full border border-indigo-500/50 p-1 bg-black/80 backdrop-blur-3xl rounded-3xl shadow-[0_0_80px_rgba(79,70,229,0.3)] relative overflow-hidden group"
          >
            {/* Tech grid background overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-screen" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
            
            {/* AUTH PORTAL UI */}
            <div className="bg-slate-950/50 border border-slate-800/50 p-8 rounded-[1.3rem] w-full shadow-inner relative z-10">
              <div className="flex gap-4 mb-8 bg-black/50 p-1.5 rounded-xl border border-slate-800/50 shadow-inner">
                <button 
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 ${isLogin ? 'bg-indigo-600/20 text-cyan-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                >
                  Login Portal
                </button>
                <button 
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 ${!isLogin ? 'bg-indigo-600/20 text-cyan-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                >
                  Create Account
                </button>
              </div>
              
              <form onSubmit={handleAuth} className={`space-y-6 ${isScanning || scanComplete ? 'hidden' : 'block'}`}>
                <div className="relative group/input">
                  <label className="text-[10px] text-cyan-500/70 font-black uppercase tracking-[0.2em] mb-2 block">Identity Vector (Email)</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-black/80 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono text-sm placeholder:text-slate-600"
                      placeholder="USER@NETWORK.CORE"
                    />
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/30 group-focus-within/input:bg-cyan-400 group-focus-within/input:shadow-[0_0_10px_#22d3ee] transition-all" />
                  </div>
                </div>
                <div className="relative group/input">
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] text-cyan-500/70 font-black uppercase tracking-[0.2em] block">Encryption Key (Password)</label>
                    {isLogin && <button type="button" className="text-[10px] text-indigo-400 hover:text-cyan-300 font-bold tracking-widest uppercase transition-colors">Bypass / Reset</button>}
                  </div>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-black/80 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono text-sm placeholder:text-slate-600 tracking-[0.3em]"
                      placeholder="••••••••"
                    />
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/30 group-focus-within/input:bg-indigo-400 group-focus-within/input:shadow-[0_0_10px_#818cf8] transition-all" />
                  </div>
                </div>
                
                <button type="submit" className="relative w-full overflow-hidden rounded-xl group/btn mt-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
                  <div className="relative bg-black/20 text-white font-black py-4 transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] border border-white/10 group-hover/btn:border-cyan-300/50 rounded-xl">
                    <span className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />
                    Initialize Link
                  </div>
                </button>

                <div className="relative flex items-center py-4 opacity-50">
                  <div className="flex-grow border-t border-cyan-900/50 border-dashed"></div>
                  <span className="flex-shrink-0 mx-4 text-cyan-700 text-[10px] font-black uppercase tracking-[0.3em]">Face ID Matrix</span>
                  <div className="flex-grow border-t border-cyan-900/50 border-dashed"></div>
                </div>

                <div className="space-y-3">
                  <button type="button" onClick={() => handleBiometric(false)} className="relative w-full overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/40 hover:border-cyan-400/50 transition-all py-4 group/bio">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                    <div className="relative flex items-center justify-center gap-3 text-indigo-300 group-hover/bio:text-cyan-300 text-sm font-bold uppercase tracking-widest transition-colors">
                      <ScanFace size={20} className="group-hover/bio:animate-pulse" /> 
                      {faceIdStored ? 'Face ID Login' : 'Biometric Handshake'}
                    </div>
                  </button>

                  {!faceIdStored && (
                    <button type="button" onClick={() => handleBiometric(true)} className="w-full text-[10px] text-cyan-500/70 hover:text-cyan-400 font-black uppercase tracking-[0.2em] text-center transition-colors pb-2">
                      + Register New Face ID
                    </button>
                  )}

                  {faceIdStored && (
                    <button type="button" onClick={() => {localStorage.removeItem("medireach_face_id"); setFaceIdStored(false);}} className="w-full text-[10px] text-red-500/70 hover:text-red-400 font-black uppercase tracking-[0.2em] text-center transition-colors pb-2">
                      - Clear Stored Face ID
                    </button>
                  )}
                </div>
              </form>

              {/* SCANNING UI */}
              {(isScanning || scanComplete) && (
                <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-2xl opacity-50 transition-colors duration-500 ${scanComplete ? 'bg-green-500' : 'bg-cyan-500 animate-pulse'}`} />
                    
                    <div className={`relative overflow-hidden w-48 h-64 rounded-3xl border-2 flex items-center justify-center transition-all duration-500 backdrop-blur-xl ${scanComplete ? 'border-green-400 bg-green-500/10' : 'border-cyan-500 bg-cyan-500/10'}`}>
                      <img src="/glass_face.png" alt="Face Scanner" className={`w-full h-full object-cover transition-opacity duration-1000 ${scanComplete ? 'opacity-100' : 'opacity-70'}`} />
                      
                      {isScanning && (
                        <>
                          <div className="absolute top-0 left-0 w-full h-2 bg-cyan-400 shadow-[0_0_30px_#22d3ee] scanner-line" />
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay" />
                        </>
                      )}
                      
                      {scanComplete && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm">
                          <ScanFace size={60} className="text-green-400 animate-in zoom-in drop-shadow-[0_0_20px_#4ade80]" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className={`text-xl font-black tracking-[0.2em] uppercase transition-colors ${scanComplete ? 'text-green-400 drop-shadow-[0_0_10px_#4ade80]' : 'text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]'}`}>
                      {scanComplete ? (isRegistering ? 'Face ID Saved' : 'Face ID Validated') : 'Mapping Facial Matrix...'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.3em]">
                      {scanComplete ? 'Handshake Successful. Routing.' : 'Keep face stable within frame'}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </motion.div>

          {/* FOOTER */}
          <div className="mt-40 w-full max-w-lg mx-auto text-center space-y-4 pb-12 opacity-60 hover:opacity-100 transition-opacity z-50 relative">
            <div className="flex justify-center gap-4 md:gap-6 text-[10px] md:text-xs font-mono uppercase tracking-widest text-cyan-500/70">
              <a href="mailto:saichintamani5@gmail.com" className="hover:text-cyan-400 transition-colors drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Support</a>
              <a href="https://github.com/saichintamani5" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Repository</a>
              <a href="https://linkedin.com/in/sai-chintamani" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">LinkedIn</a>
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Engineered by <span className="text-indigo-400 font-bold drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]">Sai Chintamani</span>
            </div>
            <div className="text-[10px] text-slate-600 font-mono tracking-widest">
              saichintamani5@gmail.com
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
