"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { TrackingData } from "@/hooks/useSpaceTracker";

interface SpaceMapProps {
  data: TrackingData | null;
  history: [number, number][];
  userLat: number | null;
  userLng: number | null;
  category?: string;
}

// Custom icons
import "leaflet-terminator";

const stationIcon = L.divIcon({
  className: "bg-transparent",
  html: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
           <g transform="translate(12, 12)">
             <!-- Central Module -->
             <rect x="10" y="4" width="4" height="16" fill="#ffffff" rx="1"/>
             <rect x="8" y="8" width="8" height="3" fill="#ffffff" rx="0.5"/>
             <rect x="8" y="13" width="8" height="3" fill="#ffffff" rx="0.5"/>
             
             <!-- Left Solar Arrays -->
             <path d="M0 6h8v4H0V6z" fill="#00f2ff" opacity="0.8" stroke="#ffffff" stroke-width="0.5"/>
             <path d="M0 14h8v4H0v-4z" fill="#00f2ff" opacity="0.8" stroke="#ffffff" stroke-width="0.5"/>
             <path d="M4 6v12" stroke="#ffffff" stroke-width="0.5"/>
             
             <!-- Right Solar Arrays -->
             <path d="M16 6h8v4h-8V6z" fill="#00f2ff" opacity="0.8" stroke="#ffffff" stroke-width="0.5"/>
             <path d="M16 14h8v4h-8v-4z" fill="#00f2ff" opacity="0.8" stroke="#ffffff" stroke-width="0.5"/>
             <path d="M20 6v12" stroke="#ffffff" stroke-width="0.5"/>
           </g>
           <!-- Pulse Ring -->
           <circle cx="24" cy="24" r="23" stroke="#00f2ff" stroke-width="1.5" opacity="0.5" style="animation: pulse 3s infinite;"/>
         </svg>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const starlinkIcon = L.divIcon({
  className: "bg-transparent",
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <!-- Flat Satellite Bus & Solar Panel -->
           <rect x="6" y="10" width="12" height="4" fill="#00f2ff" stroke="#ffffff" stroke-width="0.5" rx="1"/>
           <circle cx="12" cy="12" r="1.5" fill="#ffffff"/>
         </svg>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const userIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div style="position: relative; width: 16px; height: 16px;">
           <div style="position: absolute; width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%; top: 4px; left: 4px; box-shadow: 0 0 10px #ffffff;"></div>
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && map) {
      map.setView(center, map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  
  return null;
}

function TerminatorOverlay() {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    if (!L.terminator) return;
    
    // @ts-ignore
    const t = L.terminator({
        fillOpacity: 0.35, 
        color: '#000000', 
        fillColor: '#000000'
    });
    t.addTo(map);

    const interval = setInterval(() => {
      t.setTime();
    }, 60000); 

    return () => {
      clearInterval(interval);
      map.removeLayer(t);
    };
  }, [map]);

  return null;
}

export default function SpaceMap({ data, history, userLat, userLng, category }: SpaceMapProps) {
  
  // Anti-meridian chunking for polyline
  const splitHistoryLines = (hist: [number, number][]) => {
    const lines: [number, number][][] = [];
    let currentLine: [number, number][] = [];
    
    for (let i = 0; i < hist.length; i++) {
        const point = hist[i];
        if (i > 0) {
            const prev = hist[i-1];
            if (Math.abs(point[1] - prev[1]) > 180) { // Large long jump implies wrap
                lines.push(currentLine);
                currentLine = [point];
                continue;
            }
        }
        currentLine.push(point);
    }
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }
    return lines;
  };

  const historyLines = splitHistoryLines(history);
  const activeIcon = category === "Stations" ? stationIcon : starlinkIcon;

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[0, 0]}
        zoom={3}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        
        <TerminatorOverlay />
        
        {data && (
          <>
            <Marker position={[data.latitude, data.longitude]} icon={activeIcon} />
            <MapController center={[data.latitude, data.longitude]} />
          </>
        )}
        
        {historyLines.map((line, idx) => (
          line.length > 1 && (
            <Polyline key={idx} positions={line} pathOptions={{ color: category === "Stations" ? "#ffffff" : "#00f2ff", weight: 2, opacity: 0.6 }} />
          )
        ))}

        {userLat !== null && userLng !== null && (
          <Marker position={[userLat, userLng]} icon={userIcon} />
        )}

      </MapContainer>
    </div>
  );
}
