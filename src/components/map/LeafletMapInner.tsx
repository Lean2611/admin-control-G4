
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { DriverPosition } from "@/types/driver";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import DriverPopup from "@/components/map/DriverPopup";

const DefaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FitToMarkers({ points }: { points: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [points, map]);
  return null;
}

export default function LeafletMapInner({
  positions,
  center,
  zoom,
  onSelectDriver,
  autoFit = false, 
}: {
  positions: DriverPosition[];
  center: { lat: number; lng: number };
  zoom: number;
  onSelectDriver?: (id: number | string) => void;
  autoFit?: boolean;
}) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} className="w-full h-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
        {autoFit && <FitToMarkers points={positions} />}
      {positions.map((p) => {
        const id = p.driverId ?? p.id;
        return (
          <Marker
            key={`${p.id}`}
            position={[p.lat, p.lng]}
            eventHandlers={{
              click: () => onSelectDriver?.(id), // ⬅️ selecciona
            }}
          >
            <Popup autoPan={false}>
              <DriverPopup id={id} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}