"use client";

import { useEffect, useState } from "react";
import { Calendar, Code, FileText, User, Clock, HeartPulse, AlertTriangle, Activity } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const IconMap: Record<string, any> = {
  Calendar,
  FileText,
  Code,
  User,
  Clock,
  HeartPulse,
  AlertTriangle,
  Activity
};

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientContext: "A 45-year-old patient with a recent history of mild cardiac anomalies." })
        });
        const json = await res.json();
        
        if (json.success && json.data) {
          // Map string icon names to actual Lucide React components
          const mappedData = json.data.map((item: any) => ({
            ...item,
            icon: IconMap[item.iconName] || Activity
          }));
          setTimelineData(mappedData);
        }
      } catch (err) {
        console.error("Failed to load timeline", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-400 font-mono text-sm tracking-widest uppercase animate-pulse">Initializing Medical Trajectory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] relative">
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-tighter">Patient Trajectory</h1>
        <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mt-1">Deep Timeline Analysis</p>
      </div>
      <RadialOrbitalTimeline timelineData={timelineData} />
    </div>
  );
}
