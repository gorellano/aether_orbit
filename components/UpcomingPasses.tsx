import { useEffect, useState } from "react";
import { SatelliteId } from "@/hooks/useSpaceTracker";
import { Eye, EyeOff } from "lucide-react";

interface Pass {
  startUTC: number;
  endUTC: number;
  duration: number;
  mag: number; // visibility magnitude
}

interface PassesData {
  passes: Pass[];
  info: { passescount: number };
}

export function UpcomingPasses({ 
  satelliteId, 
  userLat, 
  userLng 
}: { 
  satelliteId: SatelliteId; 
  userLat: number | null; 
  userLng: number | null 
}) {
  const [data, setData] = useState<PassesData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userLat || !userLng) return;

    let mounted = true;
    setLoading(true);

    fetch(`/api/passes?id=${satelliteId}&lat=${userLat}&lng=${userLng}`)
      .then(res => res.json())
      .then((json: PassesData) => {
        if (mounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [satelliteId, userLat, userLng]);

  if (!userLat) return null;

  return (
    <div className="absolute right-6 top-24 z-10 glass-panel rounded-2xl p-6 w-80 flex flex-col gap-4 text-white">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Eye className="w-5 h-5 text-cyber-blue" />
        <h3 className="font-mono text-sm tracking-wider uppercase text-cyber-blue font-semibold">Próximo Pase Visible</h3>
      </div>
      
      {loading ? (
        <div className="h-16 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.passes && data.passes.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="text-xs uppercase text-white/50 font-sans tracking-wide">Sobre tu ubicación</div>
          {data.passes.slice(0, 2).map((p, idx) => {
            const date = new Date(p.startUTC * 1000);
            return (
              <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold">{date.toLocaleDateString()}</span>
                  <span className="font-sans text-xs text-white/70">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-cyber-blue">Duración</div>
                  <div className="font-sans text-xs">{Math.floor(p.duration / 60)}m {p.duration % 60}s</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
         <div className="flex flex-col items-center gap-2 py-4 text-center text-white/50">
            <EyeOff className="w-6 h-6 mb-1 opacity-50" />
            <p className="text-xs font-sans">No hay pases visibles pronosticados para los próximos días.</p>
         </div>
      )}
    </div>
  );
}
