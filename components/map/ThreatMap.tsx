"use client";

import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useSWR from "swr";
import { TrafficRecord } from "@/types/traffic";
import { PaginatedResponse } from "@/types/api";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function ArcCanvasLayer({ arcs }: { arcs: any[] }) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "400"; // Above base tiles

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();
      
      arcs.forEach(arc => {
        const start = map.latLngToContainerPoint([arc.startLat, arc.startLng]);
        const end = map.latLngToContainerPoint([arc.endLat, arc.endLng]);
        
        const elapsed = (now - arc.startTime) % arc.duration;
        const progress = elapsed / arc.duration;
        
        const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const cpX = midX;
        const cpY = midY - (dist * 0.3); // curve upwards

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);
        ctx.strokeStyle = `rgba(${arc.color}, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        const t = progress;
        const dotX = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * cpX + t * t * end.x;
        const dotY = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * cpY + t * t * end.y;
        
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${arc.color})`;
        ctx.shadowColor = `rgb(${arc.color})`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; 

        // Draw origin pulse
        const pulseT = (now % 2000) / 2000;
        ctx.beginPath();
        ctx.arc(start.x, start.y, 3 + (pulseT * 15), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${arc.color}, ${1 - pulseT})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(start.x, start.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${arc.color})`;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    const onMoveEnd = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    };
    
    map.on('move', onMoveEnd);
    map.on('resize', onMoveEnd);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      map.off('move', onMoveEnd);
      map.off('resize', onMoveEnd);
    };
  }, [map, arcs]);

  return <div className="leaflet-pane leaflet-overlay-pane"><canvas ref={canvasRef} /></div>;
}

function StatsPanel({ activeIps }: { activeIps: number }) {
  return (
    <div className="absolute top-6 right-6 z-[1000] w-72 bg-bg-surface/85 backdrop-blur-xl border border-border-subtle shadow-2xl rounded-lg p-6 text-sm">
      <h3 className="text-text-tertiary font-semibold uppercase tracking-wider text-[11px] mb-5 font-mono">Live Threat Telemetry</h3>
      
      <div className="space-y-5">
        <div className="flex justify-between items-center group">
          <span className="text-text-secondary font-medium tracking-wide">Target Nodes</span>
          <span className="font-mono text-accent-cyan font-bold bg-accent-cyan-dim px-2 py-0.5 rounded border border-accent-cyan/20">3</span>
        </div>
        <div className="flex justify-between items-center group">
          <span className="text-text-secondary font-medium tracking-wide">Live Attack Arcs</span>
          <span className="font-mono text-risk-critical font-bold text-base px-2 py-0.5 bg-risk-critical-dim rounded border border-risk-critical/20 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-risk-critical inline-block animate-pulse mr-2" />
            {activeIps}
          </span>
        </div>
        <div className="h-px bg-border-strong w-full my-2 relative">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-accent-cyan/50 to-transparent" />
        </div>
        <div className="flex justify-between items-center group">
          <span className="text-text-secondary font-medium tracking-wide">Top Origin</span>
          <span className="font-mono text-text-primary text-xs tracking-wider">UNKNOWN</span>
        </div>
        <div className="flex justify-between items-center group">
          <span className="text-text-secondary font-medium tracking-wide">Top Vector</span>
          <span className="font-mono text-risk-high text-xs px-2 py-1 rounded bg-risk-high-dim border border-risk-high/20 uppercase tracking-widest font-semibold flex items-center shadow-[0_0_10px_var(--color-risk-high)_inset]">
            Scanner
          </span>
        </div>
      </div>
    </div>
  );
}

function LiveTicker({ attacks }: { attacks: any[] }) {
  if (!attacks || attacks.length === 0) return null;
  return (
    <div className="absolute bottom-0 left-0 w-full h-[46px] bg-[#050608]/95 border-t border-border-strong z-[1000] flex items-center overflow-hidden backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex whitespace-nowrap animate-ticker-scroll items-center pl-4">
        {attacks.map((atk, i) => (
          <div key={i} className="flex items-center text-[13px] font-mono mr-12 bg-bg-surface/50 px-3 py-1.5 rounded-sm border border-border-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-pulse mr-3 shadow-[0_0_6px_var(--color-risk-critical)]"></span>
            <span className="text-text-secondary">{atk.src_ip} <span className="text-text-tertiary mx-2 font-sans">&rarr;</span> <span className="text-accent-cyan">{atk.dst_ip}</span></span>
            <span className="ml-4 px-1.5 py-0.5 rounded text-[10px] bg-risk-critical-dim text-risk-critical border border-risk-critical/20 font-sans tracking-widest font-bold">ATTACK</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ThreatMap() {
  const { data } = useSWR<PaginatedResponse<TrafficRecord>>('/api/traffic?label=ATTACK&pageSize=50', fetcher, { refreshInterval: 5000 });

  const arcs = useMemo(() => {
    if (!data?.data) return [];
    
    return data.data.map((record, idx) => {
      const hash = record.src_ip.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
      
      const startLat = (Math.abs(hash) % 120) - 60;
      const startLng = (Math.abs(hash * 2) % 300) - 150; 
      
      const targets = [
        { lat: 38.89, lng: -77.03 }, 
        { lat: 51.5, lng: -0.12 },
        { lat: 35.67, lng: 139.65 }
      ];
      const target = targets[Math.abs(hash) % targets.length];
      
      return {
        id: record._id,
        src_ip: record.src_ip,
        dst_ip: record.dst_ip,
        startLat,
        startLng,
        endLat: target.lat,
        endLng: target.lng,
        color: "255, 59, 59",
        duration: 1800 + (Math.abs(hash) % 2500),
        startTime: performance.now() + (idx * 150), 
      };
    });
  }, [data]);

  return (
    <div className="w-full h-full relative bg-[#090B0F] overflow-hidden">
      {/* Grid Pattern Overlay to match the reference UI */}
      <div 
        className="absolute inset-0 z-[50] pointer-events-none opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent,_#030406)] z-[100] pointer-events-none opacity-80" />
      
      <MapContainer 
        center={[20, 0]} 
        zoom={2.5} 
        minZoom={2} 
        maxBounds={[[-90, -180], [90, 180]]}
        className="w-full h-full z-0 bg-transparent custom-map-tiles"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          className="opacity-100 filter grayscale-[50%] contrast-[1.15]"
        />
        <ArcCanvasLayer arcs={arcs} />
      </MapContainer>
      
      <StatsPanel activeIps={arcs.length} />
      <LiveTicker attacks={data?.data || []} />
    </div>
  );
}
