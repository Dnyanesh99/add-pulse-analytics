import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import * as maplibregl from "maplibre-gl";
import Map, { Source, Layer, NavigationControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useGetBreakdownQuery } from "../../api/apiSlice";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@adpulse/ui";

const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

// Robust Fallback: Using a static object to avoid any potential scope issues
const FALLBACK_STYLE: any = {
  "version": 8,
  "sources": {},
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": { "background-color": "#080b11" }
    }
  ]
};

const COUNTRY_COORDS: Record<string, [number, number]> = {
  "USA": [-95.7129, 37.0902],
  "India": [78.9629, 20.5937],
  "Germany": [10.4515, 51.1657],
  "Brazil": [-51.9253, -14.2350],
  "UK": [-3.4360, 55.3781],
  "France": [2.2137, 46.2276],
  "Japan": [138.2529, 36.2048],
  "Australia": [133.7751, -25.2744],
  "Canada": [-106.3468, 56.1304],
  "China": [104.1954, 35.8617],
};

const MapCard = styled(Card)`
  height: 500px;
  overflow: hidden;
  margin-bottom: 24px;
  border: 1px solid ${(p) => p.theme.border};
  display: flex;
  flex-direction: column;
`;

const MapContainer = styled.div`
  width: 100%;
  flex: 1;
  position: relative;
  background: #000;
  min-height: 400px;
  min-width: 250px;

  .maplibregl-canvas { outline: none; }
`;

const StatusOverlay = styled.div<{ error?: boolean }>`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(8, 11, 17, 0.95);
  border: 1px solid ${p => p.error ? "#ef444455" : p.theme.border};
  color: ${p => p.error ? "#ef4444" : p.theme.textSecondary};
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 10;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(4px);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

export const MapSection = () => {
  const mapRef = useRef<MapRef>(null);
  const { data: countryData = [], isFetching } = useGetBreakdownQuery("country");
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<any>(MAP_STYLE_URL);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    try {
      if (!(maplibregl as any).supported()) {
        setIsSupported(false);
        setError("WebGL not supported by hardware/browser.");
      }
    } catch (e) {
      console.error("MapLibre check failed:", e);
    }
  }, []);

  const onMapLoad = useCallback((e: any) => {
    const map = e.target;
    const canvas = map.getCanvas();
    canvas.addEventListener("webglcontextlost", (ev: Event) => {
      ev.preventDefault();
      setError("Graphics memory overloaded. Attempting recovery...");
      setTimeout(() => window.location.reload(), 2000);
    });
  }, []);

  const handleMapError = useCallback((e: any) => {
    const err = e.error || e;
    console.error("Map Engine Error Detail:", err);
    
    // Fallback logic if tiles or style fails
    if (mapStyle !== FALLBACK_STYLE) {
      setError("Tile server unreachable or style error. Loading fallback mode.");
      setMapStyle(FALLBACK_STYLE);
    } else {
      setError("Critical Map Error: " + (err.message || "Unknown error"));
    }
  }, [mapStyle]);

  const geoJsonData = useMemo(() => {
    const features = countryData
      .map((d: any) => {
        const coords = COUNTRY_COORDS[d.dimension];
        if (!coords) return null;
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: coords },
          properties: {
            id: d.dimension,
            size: Math.max(8, Math.sqrt(d.impressions) * 2.5),
          },
        };
      })
      .filter(Boolean);
    return { type: "FeatureCollection", features };
  }, [countryData]);

  if (!isSupported) {
    return (
      <MapCard>
        <CardHeader><CardTitle>Global Distribution</CardTitle></CardHeader>
        <CardBody padding="0">
          <MapContainer><StatusOverlay error><span>⚠️</span> {error}</StatusOverlay></MapContainer>
        </CardBody>
      </MapCard>
    );
  }

  return (
    <MapCard>
      <CardHeader>
        <CardTitle>Global Traffic Distribution</CardTitle>
        <Badge bg={isFetching ? "rgba(255, 193, 7, 0.15)" : "rgba(16, 185, 129, 0.15)"} color={isFetching ? "#ffc107" : "#10b981"}>
          {isFetching ? "Refreshing..." : "Live"}
        </Badge>
      </CardHeader>
      <CardBody padding="0" style={{ flex: 1, display: 'flex' }}>
        <MapContainer>
          {error && (
            <StatusOverlay error={error.includes("Critical")}>
              <span>{error.includes("fallback") ? "🌐" : "⚠️"}</span>
              {error}
            </StatusOverlay>
          )}
          <Map
            ref={mapRef}
            mapLib={maplibregl}
            initialViewState={{ longitude: 10, latitude: 30, zoom: 1.5 }}
            mapStyle={mapStyle}
            onLoad={onMapLoad}
            onError={handleMapError}
            style={{ width: "100%", height: "100%" }}
            attributionControl={false}
          >
            <NavigationControl position="top-right" showCompass={false} />
            <Source id="traffic-data" type="geojson" data={geoJsonData as any}>
              <Layer
                id="point"
                type="circle"
                paint={{
                  "circle-radius": ["get", "size"],
                  "circle-color": "#10b981",
                  "circle-opacity": 0.6,
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#ffffff",
                  "circle-stroke-opacity": 0.3
                }}
              />
              <Layer
                id="point-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "id"],
                  "text-size": 11,
                  "text-offset": [0, 1.5],
                  "text-anchor": "top"
                }}
                paint={{
                  "text-color": "#ffffff",
                  "text-halo-color": "#000000",
                  "text-halo-width": 1
                }}
              />
            </Source>
          </Map>
        </MapContainer>
      </CardBody>
    </MapCard>
  );
};
