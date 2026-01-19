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
      'aurangabad railway station': [19.8744, 75.3392],
      'cidco': [19.8942, 75.3521],
      'cidco aurangabad': [19.8942, 75.3521],
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
      'cidco n-13': [19.8759, 75.3767],
      'cidco n-14': [19.8741, 75.3792],
      'cidco n-15': [19.8723, 75.3817],

      
      'osmanpura': [19.8800, 75.3410],      // residential area
      'agarkar mala': [19.8815, 75.3450],   // locality near central Aurangabad
      'harsul': [19.8900, 75.3550],         // east side neighborhood
      'hanuman nagar': [19.8850, 75.3470],  // near city center
      'market yard': [19.8770, 75.3380],    // bazaar region
      'gulmandi': [19.8767, 75.3117],       // western Aurangabad area
      'paithan gate': [19.8819, 75.3150],
      'delhi gate': [19.8867, 75.3358],

      'shendra': [19.9000, 75.3600],        // industrial/residential edge area
      'shendra midc': [19.9000, 75.3600],
      'waluj': [19.8316, 75.2347],          // MIDC and township southwest of city :contentReference[oaicite:1]{index=1}
      'chikalthana': [19.9014, 75.3819],    // industrial area
      'auric': [19.9500, 75.4100],          // Aurangabad Industrial City approximate (DMIC area)

      'road maintenance': [19.8762, 75.3433], // fallback same as city center
      'sanitation': [19.8762, 75.3433],
      'electricity': [19.8762, 75.3433],
      'water supply': [19.8762, 75.3433],
      'public works': [19.8762, 75.3433],

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
    if (count > 4) return '#ff000071';
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