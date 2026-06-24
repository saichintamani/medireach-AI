"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function LocatorPage() {
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");

  const findNearestHospitals = () => {
    setIsLocating(true);
    setError("");
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        
        try {
          const res = await fetch("/api/hospitals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              lat: position.coords.latitude, 
              lng: position.coords.longitude 
            })
          });
          const json = await res.json();
          if (json.success && json.data) {
            setHospitals(json.data);
          } else {
            setError("Failed to process hospital data.");
          }
        } catch (err) {
          setError("Network error while finding hospitals.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setError("Unable to retrieve your location. Please ensure location services are enabled.");
        setIsLocating(false);
      }
    );
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-green-400 mb-4">Emergency Locator</h1>
        <p className="text-gray-400 mb-8 max-w-2xl">
          Instantly detect your precise geolocation to find the nearest emergency healthcare facilities and hospitals with real-time routing.
        </p>

        <button 
          onClick={findNearestHospitals}
          disabled={isLocating}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isLocating ? (
            <span className="animate-pulse">Detecting Satellites...</span>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Find Nearest Hospitals
            </>
          )}
        </button>

        {error && <div className="mt-6 text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-500/30">{error}</div>}

        {location && (
          <div className="mt-8">
            <div className="text-sm text-gray-500 font-mono mb-4">
              Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {hospitals.map((h, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={h.id} 
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{h.name}</h3>
                    <span className="text-green-400 font-mono text-sm bg-green-500/10 px-2 py-1 rounded">{h.distance}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${h.status.includes('Open') ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      {h.status}
                    </span>
                    {h.emergency && (
                      <span className="text-red-400 border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded text-xs">
                        Emergency Room
                      </span>
                    )}
                  </div>
                  
                  <button className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded-lg transition-colors">
                    Get Directions
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
