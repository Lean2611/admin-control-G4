// export default function Page() {
//   return (
//     <section className="space-y-2">
//       <h1 className="text-2xl font-bold">Usuarios</h1>
//       <p className="text-muted-foreground">Clientes, permisos y administración de cuentas.</p>
//     </section>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/config/api";
import { probeBackend } from "@/lib/probe";

export default function DebugBackend() {
  const [res, setRes] = useState<any>(null);

  useEffect(() => {
    probeBackend().then(setRes).catch((e) => setRes({ ok:false, error: String(e) }));
  }, []);

  return (
    
    <pre className="text-xs p-3 border rounded">
      BASE_URL: {BASE_URL}{"\n\n"} <code>{BASE_URL}</code><br />
      Token: <code>{JSON.parse(localStorage.getItem('auth')||'{}')?.token ? 'OK' : 'NO'}</code>
      {JSON.stringify(res, null, 2)}
    </pre>
    
  );
}