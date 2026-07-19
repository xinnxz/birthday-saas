/**
 * Firebase Storage Helper Functions
 * 
 * Mengelola upload dan delete file (foto & musik) ke Firebase Storage.
 * 
 * Struktur folder di Storage:
 * cards/{cardId}/photos/{filename}   ← Foto-foto polaroid
 * cards/{cardId}/music/{filename}    ← File musik
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload foto ke Firebase Storage
 * @param cardId - ID kartu (untuk folder structure)
 * @param file - File gambar dari input
 * @param index - Nomor urut foto (0-5)
 * @returns Object berisi URL download dan path di Storage
 */
export async function uploadPhoto(
  cardId: string,
  file: File,
  index: number
): Promise<{ url: string; storagePath: string }> {
  // Buat nama file unik: cards/abc123/photos/photo-0-1689753600000.jpg
  const ext = file.name.split(".").pop();
  const storagePath = `cards/${cardId}/photos/photo-${index}-${Date.now()}.${ext}`;
  const storageRef = ref(storage, storagePath);

  // Upload file
  await uploadBytes(storageRef, file);

  // Dapatkan URL publik untuk ditampilkan
  const url = await getDownloadURL(storageRef);

  return { url, storagePath };
}

/**
 * Upload file musik ke Firebase Storage
 * @param cardId - ID kartu
 * @param file - File audio (.mp3, .wav, dll)
 * @returns Object berisi URL download dan path di Storage
 */
export async function uploadMusic(
  cardId: string,
  file: File
): Promise<{ url: string; storagePath: string }> {
  const ext = file.name.split(".").pop();
  const storagePath = `cards/${cardId}/music/song-${Date.now()}.${ext}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, storagePath };
}

/**
 * Hapus file dari Firebase Storage
 * @param storagePath - Path lengkap file di Storage
 */
export async function deleteFile(storagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    // File mungkin sudah dihapus sebelumnya, abaikan error
    console.warn("Gagal menghapus file:", storagePath, error);
  }
}
