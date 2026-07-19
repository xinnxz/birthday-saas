/**
 * Firestore Database Helper Functions
 * 
 * Semua operasi CRUD (Create, Read, Update, Delete) untuk kartu ulang tahun
 * dikumpulkan di sini agar mudah dikelola dan di-reuse di seluruh aplikasi.
 * 
 * Collection yang digunakan:
 * - "cards": Menyimpan semua data kartu ulang tahun
 * - "users": Menyimpan profil user (dikelola oleh AuthContext)
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { BirthdayCard } from "@/types";

const CARDS_COLLECTION = "cards";

/**
 * Membuat kartu baru di Firestore
 * @param card - Data kartu (tanpa id, createdAt, updatedAt)
 * @returns ID dokumen yang baru dibuat
 */
export async function createCard(
  card: Omit<BirthdayCard, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, CARDS_COLLECTION), {
    ...card,
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Mengambil kartu berdasarkan ID dokumen
 * @param id - Firestore document ID
 */
export async function getCardById(id: string): Promise<BirthdayCard | null> {
  const docSnap = await getDoc(doc(db, CARDS_COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as BirthdayCard;
}

/**
 * Mengambil kartu berdasarkan slug (URL unik)
 * Digunakan di halaman publik /card/[slug]
 * @param slug - URL unik kartu
 */
export async function getCardBySlug(slug: string): Promise<BirthdayCard | null> {
  const q = query(
    collection(db, CARDS_COLLECTION),
    where("slug", "==", slug),
    where("isPublished", "==", true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as BirthdayCard;
}

/**
 * Mengambil semua kartu milik user tertentu
 * Digunakan di dashboard "Kartu Saya"
 * @param ownerId - Firebase Auth UID
 */
export async function getCardsByOwner(ownerId: string): Promise<BirthdayCard[]> {
  const q = query(
    collection(db, CARDS_COLLECTION),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BirthdayCard[];
}

/**
 * Mengupdate kartu yang sudah ada
 * @param id - Document ID
 * @param data - Fields yang ingin diupdate
 */
export async function updateCard(
  id: string,
  data: Partial<BirthdayCard>
): Promise<void> {
  await updateDoc(doc(db, CARDS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Menghapus kartu
 * @param id - Document ID
 */
export async function deleteCard(id: string): Promise<void> {
  await deleteDoc(doc(db, CARDS_COLLECTION, id));
}

/**
 * Menambah view count kartu (saat halaman publik dibuka)
 * @param id - Document ID
 */
export async function incrementCardViews(id: string): Promise<void> {
  await updateDoc(doc(db, CARDS_COLLECTION, id), {
    views: increment(1),
  });
}

/**
 * Mengecek apakah slug sudah dipakai oleh kartu lain
 * @param slug - Slug yang ingin dicek
 * @param excludeId - ID kartu yang dikecualikan (untuk edit)
 */
export async function isSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const q = query(
    collection(db, CARDS_COLLECTION),
    where("slug", "==", slug)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return false;
  if (excludeId) {
    return snapshot.docs.some((doc) => doc.id !== excludeId);
  }
  return true;
}
