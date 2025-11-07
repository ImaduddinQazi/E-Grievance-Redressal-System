import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const HeatMap = ({ reports, onLocationClick }) => {
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const center = [19.8762, 75.3433]; // Aurangabad coordinates
  const zoomLevel = 12; // Increased zoom for Aurangabad area

  // Remove the Aurangabad filter to show all reports
  const locationGroups = {};
  reports.forEach(report => {
    if (report.location && report.location.trim() !== '') {
      const key = report.location.toLowerCase().trim();
      if (!locationGroups[key]) {
        locationGroups[key] = {
          location: report.location,
          count: 0,
          reports: [],
          coordinates: getCoordinatesFromLocation(report.location),
          departments: new Set()
        };
      }
      locationGroups[key].count++;
      locationGroups[key].reports.push(report);
      if (report.department) {
        locationGroups[key].departments.add(report.department);
      }
    }
  });

  function getCoordinatesFromLocation(location) {
    const aurangabadLocationMap = {
      'aurangabad city': [19.8762, 75.3433],
      'aurangabad station': [19.8744, 75.3392],
      'cidco': [19.8942, 75.3521],
      'cidco aurangabad': [19.8942, 75.3521],
      'jawahar colony': [19.8689, 75.3578],
      'satara parisar': [19.8825, 75.3306],
      'satara': [19.8825, 75.3306],
      'garkheda': [19.8917, 75.3689],
      'chikalthana': [19.9014, 75.3819],
      'waluj': [19.8333, 75.2333],
      'padegaon': [19.8564, 75.3750],
      'cidco n-1': [19.8976, 75.3467],
      'cidco n-2': [19.8958, 75.3492],
      'cidco n-3': [19.8939, 75.3517],
      'cidco n-4': [19.8921, 75.3542],
      'cidco n-5': [19.8903, 75.3567],
      'cidco n-6': [19.8885, 75.3592],
      'cidco n-7': [19.8867, 75.3617],
      'cidco n-8': [19.8849, 75.3642],
      'cidco n-9': [19.8831, 75.3667],
      'cidco n-10': [19.8813, 75.3692],
      'cidco n-11': [19.8795, 75.3717],
      'cidco n-12': [19.8777, 75.3742],
      'seven hills': [19.8667, 75.3417],
      'jalna road': [19.8614, 75.3458],
      'beed bypass': [19.8714, 75.3250],
      'paithan gate': [19.8819, 75.3150],
      'delhi gate': [19.8867, 75.3358],
      
      'kaulkhed': [19.8514, 75.3617],
      'mukundwadi': [19.8567, 75.3517],
      'nageshwarwadi': [19.8617, 75.3417],
      'hudco': [19.8667, 75.3317],
      'shahaganj': [19.8717, 75.3217],
      'gulmandi': [19.8767, 75.3117],
      'roshan gate': [19.8817, 75.3017],
      'bara immam': [19.8867, 75.2917],
      'kranti chowk': [19.8764, 75.3389],
      'adalat road': [19.8736, 75.3361],
      'station road': [19.8747, 75.3375],
      'juna bazar': [19.8778, 75.3350],
      'nirala bazar': [19.8792, 75.3333],
      'suraj chowk': [19.8814, 75.3319],
      'default': [19.8762, 75.3433]
    };

    const lowerLocation = location.toLowerCase();
    
    // Check for exact matches first
    for (const [key, coords] of Object.entries(aurangabadLocationMap)) {
      if (lowerLocation === key || lowerLocation.includes(key)) {
        return coords;
      }
    }
    
    // If no match found, return default Aurangabad coordinates
    return aurangabadLocationMap.default;
  }

  const getRadius = (count) => Math.min(30, 10 + (count * 4));
  const getColor = (count) => {
    if (count > 5) return '#ff000071';
    if (count > 2) return '#ff6a0064';
    if (count > 1) return '#ffd00071';
    return '#00ff625d';
  };

  // Debug: log the location groups
  console.log('Location groups:', locationGroups);
  console.log('Total reports:', reports.length);
  console.log('Groups found:', Object.keys(locationGroups).length);

  return (
    <div>
      {/* Debug information */}
      <div className="mb-2 text-muted small">
        Showing {Object.keys(locationGroups).length} locations from {reports.length} total reports
      </div>
      
      <MapContainer
        center={center}
        zoom={zoomLevel}
        style={{ height: '400px', width: '100%', borderRadius: '10px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {Object.values(locationGroups).map((group, index) => (
          <CircleMarker
            key={index}
            center={group.coordinates}
            radius={getRadius(group.count)}
            fillColor={getColor(group.count)}
            color={getColor(group.count)}
            fillOpacity={0.7}
            weight={2}
            eventHandlers={{
              click: () => onLocationClick(group),
              mouseover: () => setHoveredLocation(group),
              mouseout: () => setHoveredLocation(null)
            }}
          >
            {/* Tooltip on hover */}
            <Tooltip permanent={false} direction="top" offset={[0, -10]}>
              <strong>{group.location}</strong><br />
              {group.count} report(s)<br />
              Departments: {Array.from(group.departments).join(', ') || 'None'}
            </Tooltip>

            {/* Popup on click */}
            <Popup>
              <div style={{ maxWidth: '250px' }}>
                <h6 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{group.location}</h6>
                <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>{group.count}</strong> reports</p>
                <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Departments:</strong> {Array.from(group.departments).join(', ') || 'None'}</p>
                
                <h6 style={{ margin: '8px 0 4px 0', fontSize: '12px' }}>Recent Reports:</h6>
                {group.reports.slice(0, 3).map((report, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #eee', padding: '3px 0', fontSize: '11px' }}>
                    <strong>{report.title}</strong><br />
                    Status: <span style={{ 
                      color: report.status === 'Resolved' ? 'green' : 
                             report.status === 'In Progress' ? 'orange' : 'gray',
                      fontSize: '10px'
                    }}>{report.status}</span>
                  </div>
                ))}
                {group.reports.length > 3 && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '10px' }}>+ {group.reports.length - 3} more reports...</p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default HeatMap;