import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default points (your original 4 locations)
const DEFAULT_PTS = [
  { name: "Taalurae Island", lat: -8.908528, lng: 160.740278 },
  { name: "Takwa'arai",      lat: -8.897444, lng: 160.758556 },
  { name: "Takwaitala",      lat: -8.9155,   lng: 160.767722 },
  { name: "Malaafe Island",  lat: -8.895444, lng: 160.743667 },
];

const MapView = forwardRef(function MapView({ labels, lines, polygons }, ref) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const layersRef    = useRef({ labels: [], lines: [], polygons: [] });

  // Expose flyTo to parent
  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, zoom = 16) {
      mapRef.current?.flyTo([lat, lng], zoom, { animate: true, duration: 1.2 });
    }
  }));

  // Init map once
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 21
    }).setView([-8.906, 160.754], 13);

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 21,
      maxNativeZoom: 21
    }).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Default markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    DEFAULT_PTS.forEach(p => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;background:#ff3b3b;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.6)"></div>`,
        iconSize: [12, 12], iconAnchor: [6, 6]
      });
      L.marker([p.lat, p.lng], { icon }).addTo(map)
       .bindTooltip(p.name, { permanent: true, direction: 'top', offset: [0, -4], className: 'map-label' });
    });
  }, []);

  // Custom labels
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layersRef.current.labels.forEach(l => l.remove());
    layersRef.current.labels = (labels || []).map(p => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;background:#00d4ff;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.6)"></div>`,
        iconSize: [12, 12], iconAnchor: [6, 6]
      });
      return L.marker([p.lat, p.lng], { icon }).addTo(map)
              .bindTooltip(p.name, { permanent: true, direction: 'top', offset: [0, -4], className: 'map-label' });
    });
  }, [labels]);

  // Lines
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layersRef.current.lines.forEach(l => l.remove());
    layersRef.current.lines = (lines || []).map(line => {
      const latlngs = line.points.map(p => [p.lat, p.lng]);
      return L.polyline(latlngs, { color: '#facc15', weight: 3, opacity: 0.9 }).addTo(map);
    });
  }, [lines]);

  // Polygons
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layersRef.current.polygons.forEach(l => l.remove());
    layersRef.current.polygons = (polygons || []).map(poly => {
      const latlngs = poly.points.map(p => [p.lat, p.lng]);
      return L.polygon(latlngs, {
        color: '#4ade80', weight: 2,
        fillColor: '#4ade80', fillOpacity: 0.15
      }).addTo(map).bindTooltip(poly.area, { permanent: false, className: 'map-label' });
    });
  }, [polygons]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
});

export default MapView;
