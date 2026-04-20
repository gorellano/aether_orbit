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
  html: `<div style="position: relative; width: 32px; height: 32px;">
           <div style="position: absolute; width: 14px; height: 14px; background-color: #ffffff; border-radius: 50%; top: 9px; left: 9px; box-shadow: 0 0 20px #ffffff, 0 0 40px #00f2ff;"></div>
           <div style="position: absolute; width: 32px; height: 32px; border: 2px solid #ffffff; border-radius: 50%; opacity: 0.7; animation: pulse 2.5s infinite;"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const starlinkIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div style="position: relative; width: 16px; height: 16px;">
           <div style="position: absolute; width: 6px; height: 6px; background-color: #00f2ff; border-radius: 50%; top: 5px; left: 5px; box-shadow: 0 0 10px #00f2ff;"></div>
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
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
