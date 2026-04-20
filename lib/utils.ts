import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert degrees to radians
function toRad(value: number) {
  return (value * Math.PI) / 180;
}

/**
 * Calculates the Haversine distance between two points on the Earth.
 * Returns the distance in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Basic exponential smoothing for values (to avoid jumpy telemetry).
 */
export function smoothValue(oldValue: number, newValue: number, factor = 0.2) {
  if (isNaN(oldValue)) return newValue;
  return oldValue + (newValue - oldValue) * factor;
}
