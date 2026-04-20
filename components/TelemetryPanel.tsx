"use client";

import { motion } from "framer-motion";
import { Gauge, ArrowUpCircle, Compass } from "lucide-react";
import { TrackingData } from "@/hooks/useSpaceTracker";

interface TelemetryPanelProps {
  data: TrackingData | null;
  satelliteName: string;
}

export function TelemetryPanel({ data, satelliteName }: TelemetryPanelProps) {
  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute top-6 left-6 z-[1000] rounded-2xl glass-panel p-6 w-80 text-foreground"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-3 w-3 rounded-full bg-cyber-blue animate-pulse" />
        <h2 className="text-xl font-mono text-glow font-bold tracking-wider uppercase">
          {satelliteName}
        </h2>
      </div>

      <div className="space-y-4 font-mono text-sm">
        <div className="flex items-center justify-between border-b border-ghost-white pb-2">
          <div className="flex items-center text-gray-400">
            <Gauge className="w-4 h-4 mr-2 text-cyber-blue" />
            <span>VELOCITY</span>
          </div>
          <span className="font-semibold text-white">
            {data.velocity.toFixed(2)} km/s
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-ghost-white pb-2">
          <div className="flex items-center text-gray-400">
             <ArrowUpCircle className="w-4 h-4 mr-2 text-cyber-blue" />
             <span>ALTITUDE</span>
          </div>
          <span className="font-semibold text-white">
            {data.altitude.toFixed(2)} km
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center text-gray-400">
             <Compass className="w-4 h-4 mr-2 text-cyber-blue" />
             <span>LAT / LNG</span>
          </div>
          <span className="font-semibold text-white text-xs">
            {data.latitude.toFixed(4)}°, {data.longitude.toFixed(4)}°
          </span>
        </div>
      </div>
    </motion.div>
  );
}
