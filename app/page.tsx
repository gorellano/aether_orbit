"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { SatelliteId, useSpaceTracker } from "@/hooks/useSpaceTracker";
import { useGeolocation } from "@/hooks/useGeolocation";
import { TelemetryPanel } from "@/components/TelemetryPanel";
import { ProximityIndicator } from "@/components/ProximityIndicator";
import { ChevronDown, Globe } from "lucide-react";

// Disable SSR for the map component
const SpaceMap = dynamic(() => import("@/components/SpaceMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-deep-space flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <Globe className="w-12 h-12 text-cyber-blue mb-4 animate-spin-slow" />
        <p className="text-cyber-blue font-mono tracking-widest text-sm">INITIALIZING ORBITAL LINK...</p>
      </div>
    </div>
  ),
});

const SATELLITES: { id: SatelliteId; name: string }[] = [
  { id: "25544", name: "ISS (Int. Space Station)" },
  { id: "48274", name: "CSS (Tiangong Space Station)" },
  { id: "44713", name: "STARLINK-1007 (Leader)" },
];

export default function Home() {
  const [selectedSat, setSelectedSat] = useState<SatelliteId>("25544");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data, history, error } = useSpaceTracker(selectedSat);
  const geo = useGeolocation();

  const selectedSatName = SATELLITES.find(s => s.id === selectedSat)?.name || "";

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-deep-space text-foreground">
      
      {/* Background Map */}
      <SpaceMap 
        data={data} 
        history={history} 
        userLat={geo.latitude} 
        userLng={geo.longitude} 
      />

      {/* Glassmorphism Header & Selector */}
      <div className="absolute top-6 right-6 z-[1000]">
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="glass-panel px-6 py-3 rounded-full flex items-center space-x-4 hover:bg-ghost-hover transition-colors font-mono text-sm uppercase tracking-wider"
          >
            <span>{selectedSatName}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-4 glass-panel rounded-xl overflow-hidden min-w-[280px]">
              {SATELLITES.map((sat) => (
                <button
                  key={sat.id}
                  onClick={() => {
                    setSelectedSat(sat.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 font-mono text-sm uppercase hover:bg-cyber-blue hover:text-deep-space transition-colors
                    ${selectedSat === sat.id ? "text-cyber-blue" : "text-white"}
                  `}
                >
                  {sat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Information */}
      <TelemetryPanel data={data} satelliteName={selectedSatName.split("(")[0].trim()} />

      {/* Distance indicator relative to user location */}
      <ProximityIndicator 
        userLat={geo.latitude} 
        userLng={geo.longitude} 
        satelliteData={data} 
      />

      {error && (
        <div className="absolute bottom-6 right-6 z-[1000] glass-panel bg-red-500/20 border-red-500/50 text-red-200 px-6 py-3 rounded-lg font-mono text-xs">
          ERROR: {error}
        </div>
      )}

      {/* Basic global keyframes via inline style for custom animations used by Map marker */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}} />
    </main>
  );
}
