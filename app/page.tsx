"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ChevronDown, Globe, Search, Volume2, VolumeX } from "lucide-react";
import satellitesData from "@/data/satellites.json";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useGeolocation } from "@/hooks/useGeolocation";
import { TelemetryPanel } from "@/components/TelemetryPanel";
import { ProximityIndicator } from "@/components/ProximityIndicator";
import { UpcomingPasses } from "@/components/UpcomingPasses";
import { SatelliteId, useSpaceTracker } from "@/hooks/useSpaceTracker";

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

const SATELLITES: { id: SatelliteId; name: string; category?: string }[] = satellitesData;

export default function Home() {
  const [selectedSat, setSelectedSat] = useState<SatelliteId>("25544");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(false);

  useAudioEngine(audioEnabled);

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
        category={SATELLITES.find(s => s.id === selectedSat)?.category}
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
            <div className="absolute top-full right-0 mt-4 glass-panel rounded-xl overflow-hidden min-w-[280px] w-80">
              <div className="p-3 border-b border-white/10 relative">
                <Search className="w-4 h-4 text-white/50 absolute left-6 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search satellites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm font-sans text-white placeholder-white/40 focus:outline-none pl-10"
                />
              </div>
              <div className="max-h-64 overflow-y-auto no-scrollbar">
                {SATELLITES.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((sat) => (
                  <button
                    key={sat.id}
                    onClick={() => {
                      setSelectedSat(sat.id);
                      setIsDropdownOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-6 py-4 font-mono text-sm uppercase hover:bg-cyber-blue hover:text-deep-space transition-colors
                      ${selectedSat === sat.id ? "text-cyber-blue" : "text-white"}
                    `}
                  >
                    {sat.name}
                  </button>
                ))}
                {SATELLITES.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="px-6 py-4 font-sans text-xs text-white/50 uppercase">No results found</div>
                )}
              </div>
            </div>
          )}
        </div>
          {/* Audio Toggle */}
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="h-12 w-12 ml-4 glass-panel rounded-full flex items-center justify-center text-white/70 hover:text-cyber-blue transition-colors"
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
      </div>

      {/* Selected Satellite Telemetry & Proximity */}
      <TelemetryPanel data={data} satelliteName={selectedSatName.split("(")[0].trim()} />

      {/* Distance indicator relative to user location */}
      <ProximityIndicator 
        userLat={geo.latitude} 
        userLng={geo.longitude} 
        satelliteData={data} 
      />

      {/* Flyby / Overhead Forecasts */}
      <UpcomingPasses 
        satelliteId={selectedSat} 
        userLat={geo.latitude} 
        userLng={geo.longitude} 
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
