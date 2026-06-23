"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { OrganMesh } from "@/components/organs/OrganMesh";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isScanningBio, setIsScanningBio] = useState(false);
  const [hasDisease, setHasDisease] = useState(false);
  const [organType, setOrganType] = useState<'heart' | 'lungs'>('heart');
  
  const router = useRouter();

  useEffect(() => {
    // Load stored email on mount
    const savedEmail = localStorage.getItem("medireach_user_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleBiometricLogin = () => {
    if (!email) return alert("Enter email first to associate biometrics.");
    setIsScanningBio(true);
    
    // Simulate biometric scan
    setTimeout(() => {
      localStorage.setItem("medireach_user_email", email);
      localStorage.setItem("medireach_session", "bio_auth_valid_8x99z");
      router.push("/");
    }, 2500);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("medireach_user_email", email);
    localStorage.setItem("medireach_session", "standard_auth_valid");
    router.push("/");
  };

  const triggerDisease = () => {
    setHasDisease(true);
    // Glitch effect on DOM
    document.body.classList.add('animate-glitch');
    setTimeout(() => {
      document.body.classList.remove('animate-glitch');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#050505] flex overflow-hidden relative">
      
      {/* OS FREEZE GLITCH OVERLAY */}
      {hasDisease && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-red-900/10 flex items-center justify-center mix-blend-difference">
          <div className="w-full h-2 bg-red-500/50 animate-pulse" style={{ transform: `translateY(${Math.random()*100}px)` }}/>
        </div>
      )}

      {/* Left Panel: 3D Pink Portfolio */}
      <div className="w-1/2 h-screen relative hidden md:block border-r border-white/10 bg-black">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff3399" />
          <Stars radius={50} depth={50} count={2000} factor={2} saturation={0.5} fade />
          <OrganMesh hasDisease={hasDisease} organType={organType} />
        </Canvas>

        {/* Floating Disease Explainer Panel */}
        <AnimatePresence>
          {hasDisease && (
            <motion.div 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute top-1/4 left-8 max-w-sm bg-red-950/80 backdrop-blur-md border border-red-500 p-6 rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.4)] z-20"
            >
              <h2 className="text-2xl font-black text-red-400 mb-2 glitch-text">CRITICAL ALERT</h2>
              <h3 className="text-xl text-white font-bold mb-4 uppercase">
                {organType === 'heart' ? 'Arrhythmia Detected' : 'Acute Bronchitis Detected'}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {organType === 'heart' 
                  ? "An abnormal heart rhythm has been detected via biometric telemetry. Electrical signals controlling the heartbeat are severely delayed. Immediate prognostic intervention recommended." 
                  : "Severe inflammation of the bronchial tubes detected. Reduced oxygen saturation in lower lobes. Prognosis indicates immediate nebulizer treatment."}
              </p>
              <button 
                onClick={() => setHasDisease(false)}
                className="bg-white text-red-900 px-4 py-2 rounded font-bold text-sm hover:bg-red-200 transition-colors"
              >
                Clear Diagnostic
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Organ Selector */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
          <button onClick={() => setOrganType('heart')} className={`px-4 py-2 rounded-full text-xs font-bold border ${organType === 'heart' ? 'bg-pink-600 border-pink-400 text-white' : 'bg-black/50 border-pink-900 text-pink-500'}`}>HEART</button>
          <button onClick={() => setOrganType('lungs')} className={`px-4 py-2 rounded-full text-xs font-bold border ${organType === 'lungs' ? 'bg-pink-600 border-pink-400 text-white' : 'bg-black/50 border-pink-900 text-pink-500'}`}>LUNGS</button>
        </div>
      </div>

      {/* Right Panel: Login & Biometrics */}
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center p-8 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md bg-black/40 backdrop-blur-xl border ${hasDisease ? 'border-red-500/50' : 'border-white/10'} p-10 rounded-3xl relative z-10 transition-colors duration-500`}
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">High-Tech Access</h1>
            <p className="text-gray-400 text-sm">Prognostic Biometric Portal</p>
          </div>

          <form onSubmit={handleStandardLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Stored Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="doctor@medireach.ai"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="submit" 
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-4 rounded-xl transition-all"
              >
                Passcode
              </button>

              <button 
                type="button"
                onClick={handleBiometricLogin}
                disabled={isScanningBio}
                className="relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              >
                {isScanningBio ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Scanning...
                  </span>
                ) : (
                  "Biometric Scan"
                )}
                {isScanningBio && (
                  <motion.div 
                    animate={{ top: ['-50%', '150%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-8 bg-white/30 blur-md"
                  />
                )}
              </button>
            </div>
          </form>

          {/* Diagnostic Controls */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest">Diagnostic Tools</p>
            <button 
              onClick={triggerDisease}
              className="text-xs font-bold border border-red-500/50 text-red-400 hover:bg-red-500/20 px-6 py-2 rounded-full transition-colors"
            >
              Simulate Disease Occurrence
            </button>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-glitch {
          animation: glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-5px, 5px) }
          40% { transform: translate(-5px, -5px) }
          60% { transform: translate(5px, 5px) }
          80% { transform: translate(5px, -5px) }
          100% { transform: translate(0) }
        }
        .glitch-text {
          text-shadow: 2px 0 red, -2px 0 cyan;
        }
      `}} />
    </main>
  );
}
