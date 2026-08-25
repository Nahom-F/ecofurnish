"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// A plain divIcon avoids Leaflet's default marker image-path resolution
// headache entirely under a bundler (a well-known gotcha with Leaflet +
// webpack/turbopack) — no image assets to import or fix up.
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:9999px;background:var(--primary,#33472e);border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.5)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function ClickToMove({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function DeliveryMapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-border/60">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          draggable
          icon={pinIcon}
          eventHandlers={{
            dragend: (e) => {
              const pos = e.target.getLatLng();
              onChange(pos.lat, pos.lng);
            },
          }}
        />
        <ClickToMove onMove={onChange} />
      </MapContainer>
    </div>
  );
}
