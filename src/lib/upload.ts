"use client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadDriverImageToFirebase(
  userId: number | string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const objectPath = `users/${userId}/profile.${ext}`; // carpeta por usuario
  const r = ref(storage, objectPath);

  await uploadBytes(r, file, { contentType: file.type });
  const url = await getDownloadURL(r);
  return url;
}