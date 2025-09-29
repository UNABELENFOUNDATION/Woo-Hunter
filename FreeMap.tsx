import React, { useEffect, useRef } from 'react';

// Declare Leaflet globally
declare global {
  interface Window {
    L: any;
  }
}

const L = (window as any).L;

interface FreeMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  markers?: Array<{lat: number, lng: number, title?: string}>;
  className?: string;
}

const FreeMap: React.FC<FreeMapProps> = ({
  lat,
  lng,
  zoom = 13,
  markers = [],
  className = "free-map"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || !L) return;

      // Create map
      const map = L.map(mapRef.current).setView([lat, lng], zoom);

      // Add OpenStreetMap tiles (FREE!)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add markers
      markers.forEach(marker => {
        L.marker([marker.lat, marker.lng])
          .addTo(map)
          .bindPopup(marker.title || 'Location');
      });

      // Add your business marker
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'business-marker',
          html: '🏠',
          iconSize: [30, 30]
        })
      }).addTo(map).bindPopup('Your Business');
    }
  }, [lat, lng, zoom, markers]);

  return (
    <div className={className}>
      <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
      <style jsx>{`
        .business-marker {
          background: #3B82F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default FreeMap;