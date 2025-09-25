
"use client";
import { ApiRequestHandler } from "@/lib/api"; // ⬅️ importa BASE_URL
import { uploadDriverImageToFirebase } from "@/lib/upload";
import { BASE_URL } from "@/config/api";

export type DriverDetail = {
  id: number | string;
  name?: string;
  email?: string;
  phone?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  plate?: string;
  photoUrl?: string;
};

export type NewDriverInput = {
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  vehicleBrand?: string;
  plate?: string;
  vehicleColor?: string;
  imageFile?: File | null;
};
function extractRoles(u: any): string[] {
  const raw = u?.roles ?? u?.role ?? [];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list
    .map((r: any) =>
      typeof r === "string" ? r : (r?.name ?? r?.key ?? r?.rol ?? r?.nombre ?? "")
    )
    .map((s: any) => String(s).trim().toUpperCase())
    .filter(Boolean);
}
function isDriverUser(u: any): boolean {
  const roles = extractRoles(u);
  return roles.includes("DRIVER") || roles.includes("CONDUCTOR");
}

function firstString(...vals: any[]): string | undefined {
  for (const v of vals) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return undefined;
}

function unwrap(res: any) {
  return res?.data?.data ?? res?.data ?? res ?? null;
}
async function tryPost(path: string, body: any, headers?: any) {
  try {
    const res = await ApiRequestHandler.post(path, body, { headers });
    return unwrap(res);
  } catch {
    return null;
  }
}
async function tryPatch(path: string, body: any) {
  try {
    const res = await ApiRequestHandler.patch(path, body);
    return unwrap(res);
  } catch {
    return null;
  }
}

async function findDriverRole() {
  const roleLists = [
    await tryGet("/roles"),
    await tryGet("/api/roles"),
    await tryGet("/roles/all"),
  ].filter(Boolean);

  const flat: any[] = [];
  for (const r of roleLists) {
    if (Array.isArray(r)) flat.push(...r);
    else if (Array.isArray(r?.items)) flat.push(...r.items);
  }
  // Normaliza y busca por name/key/rol
  const wanted = ["DRIVER", "CONDUCTOR"];
  for (const role of flat) {
    const key =
      String(role?.name ?? role?.key ?? role?.rol ?? "").toUpperCase().trim();
    if (wanted.includes(key)) {
      return { id: role?.id ?? role?.role_id ?? role?.uuid ?? null, key };
    }
  }
  return null;
}
async function assignDriverRole(userId: number | string) {
  // 1) Si tu API acepta por nombre
  if (
    (await tryPost(`/users/${userId}/assign-role`, { role: "DRIVER" })) ||
    (await tryPost(`/users/${userId}/roles`, { role: "DRIVER" })) ||
    (await tryPost(`/roles/assign`, { userId, role: "DRIVER" })) ||
    (await tryPost(`/roles/assign-user`, { userId, role: "DRIVER" }))
  ) {
    return true;
  }

  // 2) Si tu API exige roleId numérico
  const r = await findDriverRole();
  if (!r?.id) return false;

  if (
    (await tryPost(`/users/${userId}/roles`, { roleIds: [r.id] })) ||
    (await tryPost(`/users/${userId}/roles`, { roles: [r.id] })) ||
    (await tryPost(`/roles/assign`, { id_user: userId, id_role: r.id })) ||
    (await tryPost(`/roles/assign_to_user`, { id_user: userId, id_role: r.id })) ||
    (await tryPost(`/users/assign-role/${userId}`, { id_role: r.id })) ||
    (await tryPatch(`/users/${userId}`, { roles: [r.id] }))
  ) {
    return true;
  }
  return false;
}
async function tryGet(path: string) {
  try {
    const res = await ApiRequestHandler.get(path);
    return unwrap(res);
  } catch {
    return null;
  }
}

function resolveUrl(u?: string): string | undefined {
  if (!u) return undefined;
  const s = String(u);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // si tu back devuelve rutas relativas de imagen, podrías prefijar con BASE_URL:
  // return `${BASE_URL}${s.startsWith("/") ? s : `/${s}`}`;
  return s;
}

/* =========================
 *  DETALLE POR ID
 * ========================= */

export async function getDriverById(id: number | string): Promise<DriverDetail | null> {
  try {
    const res = await ApiRequestHandler.get(`/driver-car-info/${id}/profile`);
    const d = unwrap(res);
    if (d) {
      const vehicle = d.vehicle ?? {};
      return {
        id,
        name: firstString(d.name),
        email: firstString(d.email),
        phone: firstString(d.phone),
        photoUrl: resolveUrl(firstString(d.photoUrl)),        // ⬅️ aquí
        vehicleBrand: firstString(vehicle.brand),
        vehicleModel: firstString(vehicle.model),
        vehicleColor: firstString(vehicle.color),
        plate: firstString(vehicle.plate),
      };
    }
  } catch {}

  // Plan B
  let user: any = null;
  let car: any = null;

  try {
    const ures = await ApiRequestHandler.get(`/users/${id}`);
    user = unwrap(ures);
  } catch {}

  try {
    const cres = await ApiRequestHandler.get(`/driver-car-info/${id}`);
    car = unwrap(cres);
  } catch {}

  if (!user && !car) return null;

  return {
    id,
    name: firstString(user?.name, user?.fullName, user?.username, user?.nombre),
    email: firstString(user?.email, user?.correo),
    phone: firstString(user?.phone, user?.phoneNumber, user?.telefono, user?.celular),
    photoUrl: resolveUrl(                                  // ⬅️ aquí
      firstString(user?.photoUrl, user?.image, user?.avatar, user?.profileImage)
    ),
    vehicleBrand: firstString(car?.brand, car?.marca),
    vehicleModel: firstString(car?.model, car?.modelo),
    vehicleColor: firstString(car?.color),
    plate: firstString(car?.plate, car?.placa),
  };
}

export async function createDriver(input: NewDriverInput): Promise<DriverDetail> {
  if (!input.name?.trim())  throw new Error("El nombre es obligatorio.");
  if (!input.email?.trim()) throw new Error("El email es obligatorio.");
  if (!input.password?.trim()) throw new Error("La contraseña es obligatoria.");
  if (!input.phone?.trim()) throw new Error("El teléfono es obligatorio.");
  const lastname = (input as any).lastname ?? input.lastName ?? "";
  if (!lastname?.trim()) throw new Error("El apellido es obligatorio.");

  // 1) Crear usuario (tu API espera 'lastname')
  const userPayload: any = {
    name: input.name,
    lastname,
    email: input.email,
    phone: input.phone,
    password: input.password,
    roles: [{ id: "DRIVER" }], // asigna rol al crear (tu ManyToMany lo soporta)
  };

  const userRes = await ApiRequestHandler.post("/users", userPayload);
  const created = userRes?.data?.data ?? userRes?.data ?? userRes;
  const userId =
    created?.id ?? created?.userId ?? created?.data?.id ?? created?.data?.userId;
  if (!userId) throw new Error("No se pudo obtener el ID del usuario creado.");

  // 2) Subir foto a Firebase (si hay) y persistir URL en tu back
  if (input.imageFile) {
    try {
      const downloadUrl = await uploadDriverImageToFirebase(userId, input.imageFile);
      // tu back suele usar campo 'image' (ajusta si es 'photoUrl' u otro)
      await new Promise(res => setTimeout(res, 250)); 
      await ApiRequestHandler.put(`/users/${userId}/image`, { image: downloadUrl });
    } catch (e: any) {
      console.warn("No se pudo subir/guardar la foto en Firebase:", e?.message || e);
      // no rompemos el flujo por la foto
    }
  }

  // 3) Upsert de info del auto
  if (input.vehicleBrand || input.plate || input.vehicleColor) {
    try {
      await ApiRequestHandler.post("/driver-car-info", {
        id_driver: userId,
        brand: input.vehicleBrand,
        plate: input.plate,
        color: input.vehicleColor,
      });
    } catch (e: any) {
      console.warn("No se pudo guardar driver-car-info:", e?.message || e);
    }
  }

  // 4) Devuelve el detalle normalizado
  const detail = await getDriverById(userId);
  return (
    detail ?? {
      id: userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      vehicleBrand: input.vehicleBrand,
      vehicleColor: input.vehicleColor,
      plate: input.plate,
    }
  );
}
/* =========================
 *  LISTADO DE CONDUCTORES
 * ========================= */
export async function listDrivers(): Promise<DriverDetail[]> {
  // 1) Intentar que el back ya filtre por rol
  const candidates = [
    "/users?role=DRIVER",
    "/users?role=driver",
    "/users?rol=DRIVER",
    "/users/drivers",
    "/drivers",
  ];

  let rawList: any[] = [];

  for (const path of candidates) {
    const data = await tryGet(path);
    const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    if (list.length) {
      // 🔒 aun si el back “dice” filtrar, volvemos a filtrar por si acaso
      rawList = list.filter(isDriverUser);
      break;
    }
  }

  // 2) Fallback: /users y filtrar en cliente
  if (rawList.length === 0) {
    const all = await tryGet("/users");
    const arr = Array.isArray(all) ? all : Array.isArray(all?.items) ? all.items : [];
    rawList = arr.filter(isDriverUser);
  }

  // 3) Map básico (usuario) + vehicle embebido si viene
  const base = rawList.map((u) => {
    const id = u.id ?? u.userId ?? u.driverId;

    const name = firstString(
      u.name, u.fullName, u.username, u.nombre,
      u.apellidos && `${u.nombre ?? ""} ${u.apellidos}`
    );
    const email = firstString(u.email, u.correo);
    const phone = firstString(u.phone, u.phoneNumber, u.telefono, u.celular, u.whatsapp);
    const photo = firstString(u.photoUrl, u.image, u.avatar, u.profileImage, u.foto, u.fotoPerfil);

    const v = u.vehicle ?? u.car ?? u.auto ?? u.vehiculo;
    const vehicleBrand = firstString(v?.brand, v?.marca);
    const vehicleModel = firstString(v?.model, v?.modelo);
    const vehicleColor = firstString(v?.color);
    const plate        = firstString(v?.plate, v?.placa);

    return {
      id,
      name,
      email,
      phone,
      photoUrl: resolveUrl(photo),
      vehicleBrand,
      vehicleModel,
      vehicleColor,
      plate,
    } as DriverDetail;
  });

  // 4) Completar con /driver-car-info/:id si faltan datos de vehículo
  await Promise.all(
    base.map(async (b) => {
      if (!b.id) return;
      const missingVehicle = !b.vehicleBrand && !b.plate && !b.vehicleColor;
      if (missingVehicle) {
        const car =
          (await tryGet(`/driver-car-info/${b.id}`)) ??
          (await tryGet(`/driver_car_info/${b.id}`));
        if (car) {
          const vehicleBrand = firstString(car?.brand, car?.marca);
          const vehicleModel = firstString(car?.model, car?.modelo);
          const vehicleColor = firstString(car?.color);
          const plate        = firstString(car?.plate, car?.placa);
          const carPhoto     = resolveUrl(firstString(car?.photoUrl));

          Object.assign(b, {
            vehicleBrand,
            vehicleModel,
            vehicleColor,
            plate,
            photoUrl: b.photoUrl ?? carPhoto,
          });
        }
      }
    })
  );

  // 5) Normaliza salida
  return base.map((b) => ({
    id: b.id!,
    name: b.name ?? `Conductor ${b.id}`,
    email: b.email,
    phone: b.phone,
    photoUrl: b.photoUrl,
    vehicleBrand: b.vehicleBrand,
    vehicleModel: b.vehicleModel,
    vehicleColor: b.vehicleColor,
    plate: b.plate,
  }));
}
// export async function listDrivers(): Promise<DriverDetail[]> {
//   const candidates = [
//     "/users?role=DRIVER",
//     "/users?role=driver",
//     "/users?rol=DRIVER",
//     "/users/drivers",
//     "/drivers",
//   ];

//   let rawList: any[] = [];

//   for (const path of candidates) {
//     const data = await tryGet(path);
//     const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
//     if (list.length) { rawList = list; break; }
//   }

//   if (rawList.length === 0) {
//     const all = await tryGet("/users");
//     const arr = Array.isArray(all) ? all : Array.isArray(all?.items) ? all.items : [];
//     rawList = arr.filter((u: any) => {
//       const rolesRaw = Array.isArray(u?.roles) ? u.roles : Array.isArray(u?.role) ? u.role : [];
//       const roles = rolesRaw.map((r: any) =>
//         String(typeof r === "string" ? r : r?.name ?? r?.key ?? "").toUpperCase()
//       );
//       return roles.includes("DRIVER") || roles.includes("CONDUCTOR");
//     });
//   }

//   const base = rawList.map((u) => {
//     const id = u.id ?? u.userId ?? u.driverId;
//     const name = firstString(u.name, u.fullName, u.username, u.nombre, u.apellidos && `${u.nombre ?? ""} ${u.apellidos}`);
//     const email = firstString(u.email, u.correo);
//     const phone = firstString(u.phone, u.phoneNumber, u.telefono, u.celular, u.whatsapp);
//     const photo = firstString(u.photoUrl, u.image, u.avatar, u.profileImage, u.foto, u.fotoPerfil);

//     // datos de vehículo embebidos (si vinieran)
//     const v = u.vehicle ?? u.car ?? u.auto ?? u.vehiculo;
//     const vehicleBrand = firstString(v?.brand, v?.marca);
//     const vehicleModel = firstString(v?.model, v?.modelo);
//     const vehicleColor = firstString(v?.color);
//     const plate = firstString(v?.plate, v?.placa);

//     return {
//       id,
//       name,
//       email,
//       phone,
//       photoUrl: resolveUrl(photo),               // ⬅️ aquí
//       vehicleBrand,
//       vehicleModel,
//       vehicleColor,
//       plate,
//     } as DriverDetail;
//   });

//   // Completa con driver-car-info si falta vehículo
//   await Promise.all(
//     base.map(async (b) => {
//       if (!b.id) return;
//       const missingVehicle = !b.vehicleBrand && !b.plate && !b.vehicleColor;
//       if (missingVehicle) {
//         const car =
//           (await tryGet(`/driver-car-info/${b.id}`)) ??
//           (await tryGet(`/driver_car_info/${b.id}`));
//         if (car) {
//           const vehicleBrand = firstString(car?.brand, car?.marca);
//           const vehicleModel = firstString(car?.model, car?.modelo);
//           const vehicleColor = firstString(car?.color);
//           const plate = firstString(car?.plate, car?.placa);
//           const carPhoto = resolveUrl(firstString(car?.photoUrl)); // por si guardas foto del coche

//           Object.assign(b, {
//             vehicleBrand,
//             vehicleModel,
//             vehicleColor,
//             plate,
//             photoUrl: b.photoUrl ?? carPhoto,   // conserva foto de user si ya había
//           });
//         }
//       }
//     })
//   );

//   return base.map((b) => ({
//     id: b.id!,
//     name: b.name ?? `Conductor ${b.id}`,
//     email: b.email,
//     phone: b.phone,
//     photoUrl: b.photoUrl,
//     vehicleBrand: b.vehicleBrand,
//     vehicleModel: b.vehicleModel,
//     vehicleColor: b.vehicleColor,
//     plate: b.plate,
//   }));
// }