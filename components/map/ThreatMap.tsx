"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";

// Import react-globe.gl with no SSR
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#050608]">
      <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
    </div>
  ),
});

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

interface RingData {
  lat: number;
  lng: number;
  maxR: number;
  propagationSpeed: number;
  repeatPeriod: number;
  color: string;
}

export function ThreatMap() {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const mapRef = useRef<LeafletMap>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isFlatMode, setIsFlatMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    if (isFlatMode && mapRef.current) {
      mapRef.current.zoomIn();
    } else if (!isFlatMode && globeEl.current) {
      const currentAltitude = globeEl.current.pointOfView().altitude;
      globeEl.current.pointOfView({ altitude: Math.max(0.1, currentAltitude - 0.5) }, 500);
    }
  };

  const handleZoomOut = () => {
    if (isFlatMode && mapRef.current) {
      mapRef.current.zoomOut();
    } else if (!isFlatMode && globeEl.current) {
      const currentAltitude = globeEl.current.pointOfView().altitude;
      globeEl.current.pointOfView({ altitude: Math.min(10, currentAltitude + 0.5) }, 500);
    }
  };

  // Auto-resize globe
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  // Set initial globe position and auto-rotate
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = !isFlatMode;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.controls().enableZoom = true;
      
      // Set point of view only on initial load, not when toggling flat mode
      if (!isFlatMode && globeEl.current.pointOfView().altitude > 9) { // crude check for uninitialized
         globeEl.current.pointOfView({ lat: 25, lng: 45, altitude: 2 }, 1000);
      }
    }
  }, [globeEl.current, isFlatMode]);

  // Generate mock data for theme
  const { arcs, rings } = useMemo(() => {
    const mockArcs: ArcData[] = [];
    const mockRings: RingData[] = [];
    
    // Central hub in Middle East (like screenshot)
    const hubLat = 24.7136;
    const hubLng = 46.6753;
    
    // Generate 15 random endpoints (reduced for performance)
    for (let i = 0; i < 15; i++) {
      const isIngress = Math.random() > 0.5;
      
      const targetLat = (Math.random() - 0.5) * 120;
      const targetLng = (Math.random() - 0.5) * 360;
      
      // Arc colors: mostly cyan/green-ish, some red
      const color = Math.random() > 0.85 ? "#ff3b3b" : 
                    Math.random() > 0.5 ? "#00ffff" : "#00ff88";

      mockArcs.push({
        startLat: isIngress ? targetLat : hubLat,
        startLng: isIngress ? targetLng : hubLng,
        endLat: isIngress ? hubLat : targetLat,
        endLng: isIngress ? hubLng : targetLng,
        color: color,
      });

      // Add rings at endpoints
      mockRings.push({
        lat: targetLat,
        lng: targetLng,
        maxR: 3 + Math.random() * 5,
        propagationSpeed: 1 + Math.random() * 2,
        repeatPeriod: 1000 + Math.random() * 2000,
        color: color
      });
    }

    // Hub ring
    mockRings.push({
      lat: hubLat,
      lng: hubLng,
      maxR: 12,
      propagationSpeed: 2,
      repeatPeriod: 800,
      color: "#00ffff"
    });

    return { arcs: mockArcs, rings: mockRings };
  }, []);

  return (
    <div className="w-full h-full relative bg-[#010203] overflow-hidden rounded-lg border border-border-subtle" ref={containerRef}>
      
      {/* Background radial gradient to give space depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#010203_100%)] z-10 pointer-events-none" />

      {/* Top Left Text: Flat Mode and Zoom Controls */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
        <button 
          onClick={handleZoomIn}
          className="flex items-center justify-center w-8 h-8 bg-transparent border border-border-strong text-text-secondary hover:text-accent-cyan hover:border-accent-cyan transition-colors rounded-sm"
        >
          <span className="text-lg leading-none">+</span>
        </button>
        <button 
          onClick={handleZoomOut}
          className="flex items-center justify-center w-8 h-8 bg-transparent border border-border-strong text-text-secondary hover:text-accent-cyan hover:border-accent-cyan transition-colors rounded-sm"
        >
          <span className="text-lg leading-none">-</span>
        </button>
        <button 
          onClick={() => setIsFlatMode(!isFlatMode)}
          className="px-4 py-1.5 border border-border-strong rounded-sm ml-2 bg-[#050608]/50 backdrop-blur-sm cursor-pointer hover:border-accent-cyan transition-colors group"
        >
          <span className="text-text-secondary group-hover:text-accent-cyan tracking-widest text-[11px] font-mono">
            {isFlatMode ? "3D MODE" : "FLAT MODE"}
          </span>
        </button>
      </div>

      {/* Top Right Text: Instructions */}
      <div className="absolute top-6 right-6 z-20">
        <span className="text-text-tertiary tracking-widest text-[10px] font-mono">
          DRAG TO ROTATE &middot; SCROLL TO ZOOM
        </span>
      </div>

      {/* The 3D Globe or 2D Map */}
      <div className="absolute inset-0 z-0">
        {isFlatMode ? (
          <MapContainer 
            ref={mapRef}
            center={[25, 45]} 
            zoom={3} 
            zoomControl={false}
            style={{ height: "100%", width: "100%", background: "#010203" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {arcs.map((arc, i) => (
              <Polyline 
                key={`arc-${i}`}
                positions={[[arc.startLat, arc.startLng], [arc.endLat, arc.endLng]]} 
                pathOptions={{ color: arc.color, weight: 1.5, opacity: 0.6 }} 
              />
            ))}
            {rings.map((ring, i) => (
              <CircleMarker 
                key={`ring-${i}`}
                center={[ring.lat, ring.lng]} 
                radius={ring.maxR / 1.5} 
                pathOptions={{ color: ring.color, fillColor: ring.color, fillOpacity: 0.4, weight: 1 }} 
              />
            ))}
          </MapContainer>
        ) : (
          <Globe
            ref={globeEl as any}
            width={dimensions.width}
            height={dimensions.height}
            
            // Globe visual config
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundColor="rgba(0,0,0,0)"
            
            // Arcs config
            arcsData={arcs}
            arcStartLat={(d: any) => d.startLat}
            arcStartLng={(d: any) => d.startLng}
            arcEndLat={(d: any) => d.endLat}
            arcEndLng={(d: any) => d.endLng}
            arcColor={(d: any) => [d.color, d.color]}
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={2000}
            arcStroke={0.5}
            
            // Rings config (dots on surface)
            ringsData={rings}
            ringColor={(d: any) => d.color}
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"

            // Additional config for theme
            atmosphereColor="#0055ff"
            atmosphereAltitude={0.15}
          />
        )}
      </div>
    </div>
  );
}

