// "use client";

// import { useEffect, useState } from "react";
// import { getSocket } from "@/lib/socket";
// import { BASE_URL } from "@/lib/api";

// type LastEvt = { name: string; payload: any };

// export default function SocketDebug() {
//   const [connected, setConnected] = useState(false);
//   const [id, setId] = useState<string | null>(null);
//   const [last, setLast] = useState<LastEvt | null>(null);

//   useEffect(() => {
//     const s = getSocket();

//     const onConnect = () => { setConnected(true); setId(s.id || null); };
//     const onDisconnect = () => { setConnected(false); setId(null); };
//     const onAny = (evt: string, payload: any) => {
//       console.log("[socket:onAny]", evt, payload);
//       setLast({ name: evt, payload });
//     };

//     s.on("connect", onConnect);
//     s.on("disconnect", onDisconnect);
//     s.onAny(onAny);

//     return () => {
//       s.off("connect", onConnect);
//       s.off("disconnect", onDisconnect);
//       s.offAny?.(onAny);
//     };
//   }, []);

//   return (
//     <div className="border rounded p-3 text-sm space-y-2">
//       <div className="font-semibold">Socket Debug</div>
//       <div>BASE_URL: <code>{BASE_URL}</code></div>
//       <div>Estado: {connected ? "✅ Conectado" : "❌ Desconectado"} {id ? `(id: ${id})` : ""}</div>

//       <div className="flex gap-2">
//         <button
//           onClick={() => getSocket().emit("ping", { from: "admin" })}
//           className="border rounded px-3 py-1 hover:bg-muted"
//         >
//           Emitir "ping"
//         </button>
//         <button
//           onClick={() => getSocket().emit("chage_driver_position", { id_driver: 999, lat: 32.46327, lng: -116.83904 })}
//           className="border rounded px-3 py-1 hover:bg-muted"
//         >
//           Emitir "chage_driver_position" (demo)
//         </button>
//       </div>

//       <div>
//         <div className="font-medium">Último evento recibido:</div>
//         {last ? (
//           <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
//             {JSON.stringify(last, null, 2)}
//           </pre>
//         ) : (
//           <div className="text-xs text-muted-foreground">— (aún nada) —</div>
//         )}
//       </div>
//     </div>
//   );
// }