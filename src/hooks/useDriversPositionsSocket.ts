"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

export type DriverPosition = {
  id_driver: number | string;   // puede ser el id del driver o, en fallback, el id_socket
  lat: number;
  lng: number;
  name?: string;
  updatedAt?: string;
};

type PosWithSock = DriverPosition & { id_socket?: string };

function pickNum(...vals: any[]): number | undefined {
  for (const v of vals) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function normalizeOne(p: any): PosWithSock | null {
  if (!p || typeof p !== "object") return null;

  // ⬅️ Fallback a id_socket si no hay id_driver
  const id = p.id_driver ?? p.driverId ?? p.userId ?? p.id ?? p.id_socket;
  const id_socket = p.id_socket;

  // Soporta: {lat,lng} | {latitude,longitude} | {x,y} | {position:{x,y}}
  const lat = pickNum(p.lat, p.latitude, p.y, p?.position?.y);
  const lng = pickNum(p.lng, p.lon, p.longitude, p.x, p?.position?.x);

  if (id == null || lat === undefined || lng === undefined) return null;

  return {
    id_driver: id,      // guardamos el identificador (driver o socket)
    id_socket,
    lat,
    lng,
    updatedAt: new Date().toISOString(),
  };
}

export function useDriversPositionsSocket() {
  const [list, setList] = useState<DriverPosition[]>([]);
  const byDriver = useRef<Map<string | number, PosWithSock>>(new Map());
  const sockToDriver = useRef<Map<string, string | number>>(new Map());

  useEffect(() => {
    const s = getSocket();

    // Útil mientras depuras: ver nombres/payloads recibidos
    s.onAny((event, payload) => console.log("[socket]", event, payload));

    const handleIncoming = (payload: any) => {
      const arr = Array.isArray(payload) ? payload : [payload];
      let changed = false;

      for (const raw of arr) {
        const rec = normalizeOne(raw);
        if (!rec) continue;

        byDriver.current.set(rec.id_driver, rec);
        if (rec.id_socket) {
          sockToDriver.current.set(rec.id_socket, rec.id_driver);
        }
        changed = true;
      }

      if (changed) {
        setList(
          Array.from(byDriver.current.values()).map(({ id_socket, ...rest }) => rest)
        );
      }
    };

    const POSITION_EVENTS = [
      "new_driver_position",    // tu gateway está emitiendo esto
      "chage_driver_position",  // por si llega directo desde la app
      "driver_position",
      "position_update",
      "positions",
      "drivers_positions",
      "data",
    ];
    POSITION_EVENTS.forEach((evt) => s.on(evt, handleIncoming));

    const onDriverDisconnected = (p: any) => {
      const sock = p?.id_socket;
      if (!sock) return;
      const id_driver = sockToDriver.current.get(sock);
      if (id_driver !== undefined) {
        byDriver.current.delete(id_driver);
        sockToDriver.current.delete(sock);
        setList(
          Array.from(byDriver.current.values()).map(({ id_socket, ...rest }) => rest)
        );
      }
    };
    s.on("driver_disconnected", onDriverDisconnected);

    return () => {
      POSITION_EVENTS.forEach((evt) => s.off(evt, handleIncoming));
      s.off("driver_disconnected", onDriverDisconnected);
    };
  }, []);

  return list;
}