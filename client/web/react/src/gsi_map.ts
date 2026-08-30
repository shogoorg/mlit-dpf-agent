import { mapsAgenticUICatalog } from '@googlemaps/a2ui/lit';
import { html, nothing } from 'lit';

/**
 * Patch mapsAgenticUICatalog to render official MLIT / GSI 2D Map (国土地理院 2D 地図)
 * with all POINT pin markers and conditional route line for directions.
 */
function patchMapElement(proto: any) {
  if (!proto) return;

  // Prevent Google Maps 3D/SDK initialization errors
  proto.firstUpdated = function () {};
  proto.updated = function () {};

  proto.render = function () {
    const props = this.controller?.props;
    if (!props) return nothing;

    const center = typeof this.getCenter === 'function' ? this.getCenter() : { lat: 35.8617, lng: 139.6455 };
    const centerLat = center.lat ?? center.latitude ?? 35.8617;
    const centerLng = center.lng ?? center.longitude ?? 139.6455;
    let zoom = props.zoom ?? 15;
    if (zoom > 18) zoom = 18;

    // Determine if this is an explicit Route query
    const isRoute = !!(
      props.routes ||
      props.travelMode ||
      (props.anchorMarker?.label && props.anchorMarker.label.includes('出発'))
    );

    // Collect Anchor Marker (Origin / Departure)
    const anchor = props.anchorMarker;
    const anchorData = anchor && (anchor.lat || anchor.latitude) ? {
      lat: anchor.lat ?? anchor.latitude,
      lng: anchor.lng ?? anchor.longitude,
      label: anchor.label || (isRoute ? '出発地' : '検索起点')
    } : {
      lat: centerLat,
      lng: centerLng,
      label: isRoute ? '出発地' : '検索地点'
    };

    // Collect Surrounding Markers (Shelters / Destination)
    const rawMarkers = Array.isArray(props.markers) ? props.markers : [];
    const markersData = rawMarkers.map((m: any, idx: number) => ({
      lat: m.lat ?? m.latitude ?? 0,
      lng: m.lng ?? m.longitude ?? 0,
      label: m.label || `地点 #${idx + 1}`
    })).filter((m: any) => m.lat && m.lng);

    const allPointsJson = JSON.stringify({
      anchor: anchorData,
      markers: markersData,
      zoom: zoom,
      isRoute: isRoute
    });

    const mapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #18181b; }
    .leaflet-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .leaflet-popup-content-wrapper { border-radius: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .anchor-icon {
      background: #ef4444;
      border: 2px solid white;
      color: white;
      font-weight: bold;
      border-radius: 50%;
      width: 28px !important;
      height: 28px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
    .facility-icon {
      background: #3b82f6;
      border: 2px solid white;
      color: white;
      font-weight: bold;
      font-size: 11px;
      border-radius: 50%;
      width: 26px !important;
      height: 26px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const data = ${allPointsJson};
    const map = L.map('map', { zoomControl: true }).setView([data.anchor.lat, data.anchor.lng], data.zoom);

    // Official GSI 2D standard map tiles
    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
      maxZoom: 18,
    }).addTo(map);

    const bounds = [];
    const routePoints = [];

    // 1. Origin / Departure Marker (🚩)
    if (data.anchor.lat && data.anchor.lng) {
      const anchorIcon = L.divIcon({
        className: 'anchor-icon',
        html: '🚩',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });
      const anchorMarker = L.marker([data.anchor.lat, data.anchor.lng], { icon: anchorIcon, zIndexOffset: 1000 }).addTo(map);
      anchorMarker.bindPopup('<b>' + data.anchor.label + '</b>');
      bounds.push([data.anchor.lat, data.anchor.lng]);
      routePoints.push([data.anchor.lat, data.anchor.lng]);
    }

    // 2. Surrounding Shelter / Destination Markers
    data.markers.forEach((m, idx) => {
      const isDestination = data.isRoute && (data.markers.length === 1 || m.label.includes('目的') || m.label.includes('到着'));
      const iconHtml = isDestination ? '🏁' : '' + (idx + 1);
      const facilityIcon = L.divIcon({
        className: 'facility-icon',
        html: iconHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -13]
      });
      const marker = L.marker([m.lat, m.lng], { icon: facilityIcon }).addTo(map);
      marker.bindPopup('<b>' + m.label + '</b><br><span style="color:#666;font-size:11px;">緯度: ' + m.lat.toFixed(4) + ', 経度: ' + m.lng.toFixed(4) + '</span>');
      bounds.push([m.lat, m.lng]);
      routePoints.push([m.lat, m.lng]);
    });

    // 3. Draw Route Polyline ONLY for Route / Directions queries
    if (data.isRoute && routePoints.length >= 2) {
      L.polyline(routePoints, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);
    }

    // Auto fit bounds to include all markers
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  </script>
</body>
</html>`;

    return html`
      <section
        style="width: 100%; height: 340px; margin-bottom: 16px; border-radius: 16px; overflow: hidden; border: 1px solid #3f3f46; position: relative; background: #18181b;"
      >
        <iframe
          srcdoc="${mapHtml}"
          style="width: 100%; height: 100%; border: none; display: block;"
          title="国土地理院 2D 地図"
          loading="lazy"
        ></iframe>
      </section>
    `;
  };
}

// 1. Patch catalog registered components
for (const compItem of mapsAgenticUICatalog.components.values()) {
  const comp = compItem as any;
  if (comp && comp.prototype) {
    const isMap =
      comp.name === 'A2uiGoogleMap' ||
      comp.name === 'GoogleMap' ||
      comp.tagName === 'a2ui-googlemap' ||
      comp.tagName === 'a2ui-google-map' ||
      typeof comp.prototype.getCenter === 'function';

    if (isMap) {
      patchMapElement(comp.prototype);
    }
  }
}

// 2. Patch CustomElements registry directly
const el1 = customElements.get('a2ui-googlemap') as any;
if (el1?.prototype) patchMapElement(el1.prototype);

const el2 = customElements.get('a2ui-google-map') as any;
if (el2?.prototype) patchMapElement(el2.prototype);
