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
}

// Custom icons
const satelliteIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div style="position: relative; width: 24px; height: 24px;">
           <div style="position: absolute; width: 12px; height: 12px; background-color: #00f2ff; border-radius: 50%; top: 6px; left: 6px; box-shadow: 0 0 15px #00f2ff;"></div>
           <div style="position: absolute; width: 24px; height: 24px; border: 2px solid #00f2ff; border-radius: 50%; opacity: 0.5; animation: pulse 2s infinite;"></div>
         </div>`,
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

export default function SpaceMap({ data, history, userLat, userLng }: SpaceMapProps) {
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
        {/* CartoDB Dark Matter base map for minimal distactions */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        
        {data && (
          <>
            <Marker position={[data.latitude, data.longitude]} icon={satelliteIcon} />
            <MapController center={[data.latitude, data.longitude]} />
          </>
        )}
        
        {history.length > 1 && (
          <Polyline positions={history} pathOptions={{ color: "#00f2ff", weight: 2, opacity: 0.6 }} />
        )}

        {userLat !== null && userLng !== null && (
          <Marker position={[userLat, userLng]} icon={userIcon} />
        )}

      </MapContainer>
    </div>
  );
}
