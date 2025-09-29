import React from 'react';

interface Competitor {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
}

interface StaticFreeMapProps {
  businessLat: number;
  businessLng: number;
  businessName?: string;
  competitors?: Competitor[];
  zoom?: number;
  width?: number;
  height?: number;
  className?: string;
}

const StaticFreeMap: React.FC<StaticFreeMapProps> = ({
  businessLat,
  businessLng,
  businessName = "Your Business",
  competitors = [],
  zoom = 13,
  width = 400,
  height = 300,
  className = "static-free-map"
}) => {
  // Create OpenStreetMap embed URL with markers
  const baseUrl = 'https://www.openstreetmap.org/export/embed.html';

  // Calculate bounding box that includes business and all competitors
  let minLat = businessLat;
  let maxLat = businessLat;
  let minLng = businessLng;
  let maxLng = businessLng;

  competitors.forEach(comp => {
    if (comp.latitude && comp.longitude) {
      minLat = Math.min(minLat, comp.latitude);
      maxLat = Math.max(maxLat, comp.latitude);
      minLng = Math.min(minLng, comp.longitude);
      maxLng = Math.max(maxLng, comp.longitude);
    }
  });

  // Add some padding
  const latPadding = (maxLat - minLat) * 0.1 || 0.01;
  const lngPadding = (maxLng - minLng) * 0.1 || 0.01;

  const bbox = `${minLng - lngPadding},${minLat - latPadding},${maxLng + lngPadding},${maxLat + latPadding}`;

  // Create marker string for OpenStreetMap embed
  let markerString = `${businessLat},${businessLng}`; // Business marker

  // Add competitor markers
  competitors.forEach((comp, index) => {
    if (comp.latitude && comp.longitude) {
      markerString += `;${comp.latitude},${comp.longitude}`;
    }
  });

  const embedUrl = `${baseUrl}?bbox=${bbox}&layer=mapnik&marker=${markerString}`;

  return (
    <div className={className}>
      <iframe
        src={embedUrl}
        width={width}
        height={height}
        style={{ border: 'none', borderRadius: '8px' }}
        title="Free OpenStreetMap"
      />
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
        🏠 {businessName} • {competitors.length} competitors • 🗺️ Free OpenStreetMap
      </div>
    </div>
  );
};

export default StaticFreeMap;