"use client";

import { motion, useSpring, useMotionValue } from "framer-motion";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
import { calculateDistance } from "@/lib/utils";
import { TrackingData } from "@/hooks/useSpaceTracker";

interface ProximityIndicatorProps {
  userLat: number | null;
  userLng: number | null;
  satelliteData: TrackingData | null;
}

export function ProximityIndicator({ userLat, userLng, satelliteData }: ProximityIndicatorProps) {
  const distanceValue = useMotionValue(0);

  useEffect(() => {
    if (userLat && userLng && satelliteData) {
      const targetDistance = calculateDistance(
        userLat,
        userLng,
        satelliteData.latitude,
        satelliteData.longitude
      );
      distanceValue.set(targetDistance);
    }
  }, [userLat, userLng, satelliteData, distanceValue]);

  // Hook to force re-renders if we want to display the animated number text, 
  // but framer-motion recommends doing it carefully. We will skip displaying animated text for now 
  // or use the raw target distance for text, and animated width for bar.
  
  if (!userLat || !userLng || !satelliteData) return null;

  const currentDist = calculateDistance(userLat, userLng, satelliteData.latitude, satelliteData.longitude);
  const maxEarthDist = 20000;
  const closeness = Math.max(0, Math.min(100, 100 - (currentDist / maxEarthDist) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[1000] glass-panel px-8 py-4 rounded-full flex items-center space-x-6 min-w-[360px]"
    >
      <div className="flex items-center text-cyber-blue">
        <MapPin className="w-5 h-5 mr-2" />
        <span className="font-mono text-sm tracking-widest uppercase font-bold text-glow">PROXIMITY</span>
      </div>

      <div className="flex-grow h-2 bg-ghost-white rounded-full overflow-hidden relative">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-cyber-blue shadow-[0_0_10px_#00f2ff]"
          initial={{ width: 0 }}
          animate={{ width: `${closeness}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        />
      </div>

      <span className="font-mono text-white text-sm whitespace-nowrap min-w-[80px] text-right font-semibold">
        {currentDist.toFixed(0)} km
      </span>
    </motion.div>
  );
}
