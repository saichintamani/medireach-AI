"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function VisionSystemPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!image) return;
    setIsScanning(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image })
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ primaryDiagnosis: "Scan Failed" });
    }
    setIsScanning(false);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-8 flex flex-col items-center">
      <Link href="/" className="self-start text-indigo-400 hover:text-indigo-300 font-bold mb-8 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tighter mb-4">
          Medical Vision System
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Upload X-Rays, MRIs, or Lab Reports. The Vision Agent will perform OCR and output a Doctor-Level reasoning report.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Upload Zone */}
        <div className="bg-slate-900/50 p-8 rounded-3xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center relative min-h-[400px]">
          {image ? (
            <img src={image} alt="Uploaded medical document" className="absolute inset-0 w-full h-full object-contain rounded-3xl p-4" />
          ) : (
            <>
              <div className="w-20 h-20 bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <p className="text-slate-300 font-bold text-xl mb-2">Drag & Drop Report</p>
              <p className="text-slate-500 mb-6">or click to browse</p>
            </>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            accept="image/*"
          />
        </div>

        {/* AI Results Zone */}
        <div className="flex flex-col">
          <button 
            onClick={handleScan}
            disabled={!image || isScanning}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] mb-8"
          >
            {isScanning ? "Processing Image Pipeline..." : "INITIATE VISION SCAN"}
          </button>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex-1 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                  <span className="text-slate-400 font-mono text-sm">Document: {result.documentType}</span>
                  <span className="bg-green-900/30 text-green-400 border border-green-800 px-3 py-1 rounded-full text-xs font-bold">
                    Confidence: {result.confidenceScore}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Primary Diagnosis</h3>
                  <p className="text-xl font-bold text-white bg-slate-800 p-4 rounded-xl border border-slate-700">
                    {result.primaryDiagnosis}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Detected Anomalies</h3>
                  <ul className="space-y-2">
                    {result.detectedAnomalies?.map((a: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-red-400 mt-1">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Suggested Actions</h3>
                  <ul className="space-y-2">
                    {result.suggestedActions?.map((a: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-indigo-300 bg-indigo-900/20 p-3 rounded-lg border border-indigo-900/30">
                        <span className="text-indigo-400 mt-1">→</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
