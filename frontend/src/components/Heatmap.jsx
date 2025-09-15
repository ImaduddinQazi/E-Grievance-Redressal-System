import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import './Heatmap.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Heatmap layer component
function HeatmapLayer({ data }) {
  const map = useMap();

  useEffect(() => {
    if (data && data.length > 0) {
      const heatLayer = L.heatLayer(data, {
        radius: 40,
        blur: 25,
        maxZoom: 15,
        minOpacity: 0.5,
        gradient: {
          0.1: 'blue',    // 1 complaint
          0.3: 'cyan',    // 2 complaints
          0.5: 'lime',    // 3-4 complaints
          0.7: 'yellow',  // 5-7 complaints
          0.9: 'red'      // 8+ complaints
        }
      }).addTo(map);

      // Cleanup on unmount
      return () => {
        map.removeLayer(heatLayer);
      };
    }
  }, [map, data]);

  return null;
}

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Maharashtra center coordinates
  const maharashtraCenter = [19.7515, 75.7139];

  useEffect(() => {
    fetchHeatmapData();
    // Set map ready after a small delay to ensure DOM is rendered
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch('http://localhost:5000/heatmap-data');
      const data = await response.json();

      if (response.ok) {
        setHeatmapData(data.heatmapData || []);
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading heatmap data...</div>;
  }

  return (
    <div className="heatmap-container">
      <h2>Grievance Heatmap - Maharashtra</h2>
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color low"></span>
          <span>Low complaints</span>
        </div>
        <div className="legend-item">
          <span className="legend-color medium"></span>
          <span>Medium complaints</span>
        </div>
        <div className="legend-item">
          <span className="legend-color high"></span>
          <span>High complaints</span>
        </div>
      </div>

      {mapReady && (
        <MapContainer
          center={maharashtraCenter}
          zoom={6}
          style={{ height: '500px', width: '100%' }}
          whenReady={() => console.log("Map is ready")}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {heatmapData.length > 0 && (
            <HeatmapLayer data={heatmapData} />
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default Heatmap;