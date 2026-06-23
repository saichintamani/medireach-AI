"use client";

import { useState, useRef } from "react";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { VisualizerMesh } from "@/components/visualizer/VisualizerMesh";
import { audioAnalyzer } from "@/lib/audioAnalyzer";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Agent State
  const [agentInput, setAgentInput] = useState("");
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState("Agent ready to modify visualization parameters.");
  const [visualState, setVisualState] = useState({
    colorScheme: "#00ffff",
    speedMultiplier: 1.0,
    geometryMode: "icosahedron"
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !audioRef.current) return;
    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    audioRef.current.src = objectUrl;
    audioAnalyzer.init(audioRef.current);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!fileName) return alert("Please upload an audio file first!");
      audioAnalyzer.init(audioRef.current);
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAgentPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim()) return;
    setIsAgentLoading(true);
    setAgentResponse("Agent is analyzing request...");
    try {
      const res = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: agentInput })
      });
      const data = await res.json();
      setVisualState({
        colorScheme: data.colorScheme || visualState.colorScheme,
        speedMultiplier: data.speedMultiplier || visualState.speedMultiplier,
        geometryMode: data.geometryMode || visualState.geometryMode
      });
      setAgentResponse(data.agentResponse || "Visualization updated.");
    } catch {
      setAgentResponse("Agent failed to process request.");
    }
    setIsAgentLoading(false);
    setAgentInput("");
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
      
      {/* 3D Background */}
      <div className="w-full h-full absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <VisualizerMesh {...visualState} />
          <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute bottom-10 flex flex-col items-center gap-4 bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl z-10 w-[90%] max-w-2xl">
        
        <div className="text-cyan-400 font-mono text-sm mb-2 text-center h-6">
          {isAgentLoading ? <span className="animate-pulse">{agentResponse}</span> : `[Agent] ${agentResponse}`}
        </div>

        <form onSubmit={handleAgentPrompt} className="w-full flex gap-2">
          <input 
            type="text" 
            value={agentInput}
            onChange={(e) => setAgentInput(e.target.value)}
            disabled={isAgentLoading}
            placeholder="Tell the Orchestrator Agent how to change the animation (e.g. 'Make it a fast red torus')..."
            className="flex-1 bg-white/10 text-white rounded-full px-4 py-2 border border-white/20 focus:outline-none focus:border-cyan-400"
          />
          <button type="submit" disabled={isAgentLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-full font-bold">
            Execute
          </button>
        </form>

        <div className="flex gap-4 w-full justify-between items-center mt-2 border-t border-white/10 pt-4">
          <div className="text-white/70 text-xs">
            {fileName ? `Audio: ${fileName}` : "Upload an audio track ->"}
          </div>
          <div className="flex gap-2">
            <audio ref={audioRef} crossOrigin="anonymous" onEnded={() => setIsPlaying(false)} className="hidden" />
            <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all">
              Upload
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
            <button onClick={togglePlay} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isPlaying ? "bg-red-500 hover:bg-red-400 text-white" : "bg-white text-black hover:bg-gray-200"}`}>
              {isPlaying ? "Pause" : "Play"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
