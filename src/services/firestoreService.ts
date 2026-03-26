import {
  collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  Ticket, TicketStatus, TicketPriority, LibraryItem, StudentProfile,
  Announcement, GrowthData, User, UserRole,
} from '@/types';

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function tsToStr(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  return String(ts);
}

// ─────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────
export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { ...d, uid: snap.id, createdAt: tsToStr(d.createdAt) } as User;
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id, createdAt: tsToStr((d.data() as any).createdAt) } as User));
}

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id, createdAt: tsToStr((d.data() as any).createdAt) } as User));
}

// ─────────────────────────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────────────────────────
export async function createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(db, 'tickets'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllTickets(): Promise<Ticket[]> {
  const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      ...data,
      id: d.id,
      createdAt: tsToStr(data.createdAt),
      updatedAt: tsToStr(data.updatedAt),
    } as Ticket;
  });
}

export async function getTicketsByUser(uid: string): Promise<Ticket[]> {
  const q = query(collection(db, 'tickets'), where('raisedBy', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return { ...data, id: d.id, createdAt: tsToStr(data.createdAt), updatedAt: tsToStr(data.updatedAt) } as Ticket;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getTicketsByDept(dept: string): Promise<Ticket[]> {
  const q = query(collection(db, 'tickets'), where('dept', '==', dept));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return { ...data, id: d.id, createdAt: tsToStr(data.createdAt), updatedAt: tsToStr(data.updatedAt) } as Ticket;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateTicketStatus(id: string, status: TicketStatus, aiSummary?: string, aiPriority?: TicketPriority) {
  const updates: any = { status, updatedAt: serverTimestamp() };
  if (aiSummary) updates.aiSummary = aiSummary;
  if (aiPriority) updates.aiPriority = aiPriority;
  await updateDoc(doc(db, 'tickets', id), updates);
}

export async function updateTicketAI(id: string, aiSummary: string, aiPriority: TicketPriority) {
  await updateDoc(doc(db, 'tickets', id), { aiSummary, aiPriority, updatedAt: serverTimestamp() });
}

// ─────────────────────────────────────────────────────────────────
// DIGITAL LIBRARY
// ─────────────────────────────────────────────────────────────────
export async function createLibraryItem(data: Omit<LibraryItem, 'id' | 'createdAt' | 'displayId'>): Promise<string> {
  const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const displayId = `#SVCE-${data.type.toUpperCase()}-${shortId}`;
  const ref = await addDoc(collection(db, 'library'), {
    ...data,
    displayId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllLibraryItems(): Promise<LibraryItem[]> {
  const q = query(collection(db, 'library'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: tsToStr((d.data() as any).createdAt) } as LibraryItem));
}

export async function getLibraryByDeptYear(dept: string, year: number): Promise<LibraryItem[]> {
  const q = query(
    collection(db, 'library'),
    where('dept', '==', dept),
    where('year', '==', year),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: tsToStr((d.data() as any).createdAt) } as LibraryItem))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteLibraryItem(id: string) {
  await deleteDoc(doc(db, 'library', id));
}

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const storageRef = ref(storage, path);
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      'state_changed',
      (snap) => {
        if (snap.totalBytes > 0) onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      },
    );
  });
}

// ─────────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────────
export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
  const snap = await getDoc(doc(db, 'students', uid));
  if (!snap.exists()) return null;
  return { ...snap.data(), uid: snap.id } as StudentProfile;
}

export async function getStudentsByDept(dept: string): Promise<StudentProfile[]> {
  const q = query(collection(db, 'students'), where('dept', '==', dept));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as StudentProfile));
}

export async function getAllStudents(): Promise<StudentProfile[]> {
  const snap = await getDocs(collection(db, 'students'));
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as StudentProfile));
}

export async function updateStudentProfile(uid: string, data: Partial<StudentProfile>) {
  await updateDoc(doc(db, 'students', uid), data as any);
}

export async function uploadToCloudinary(file: File, onProgress?: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'campus_aid_unsigned');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/dfvs2srlx/auto/upload');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url);
      } else {
        let errMsg = xhr.responseText;
        try { errMsg = JSON.parse(xhr.responseText)?.error?.message || errMsg; } catch {}
        console.error('Cloudinary error:', xhr.status, errMsg);
        reject(new Error(`Cloudinary (${xhr.status}): ${errMsg}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}
export async function createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'announcements'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAnnouncements(targetRole?: string): Promise<Announcement[]> {
  let q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  let items = snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: tsToStr((d.data() as any).createdAt),
  } as Announcement));
  if (targetRole && targetRole !== 'admin') {
    items = items.filter((a: any) => a.targetRole === 'all' || a.targetRole === targetRole);
  }
  return items;
}

export async function deleteAnnouncement(id: string) {
  await deleteDoc(doc(db, 'announcements', id));
}

// ─────────────────────────────────────────────────────────────────
// CAMPUS GROWTH
// ─────────────────────────────────────────────────────────────────
export const DEFAULT_GROWTH_DATA: GrowthData = {
  totalStudents: 2840,
  placedStudents: 1920,
  companies: 87,
  events: 42,
  facultyCount: 186,
  avgCgpa: 7.8,
  deptWiseData: [
    { dept: 'CSE', students: 720, placed: 612 },
    { dept: 'ECE', students: 540, placed: 378 },
    { dept: 'MECH', students: 480, placed: 288 },
    { dept: 'CIVIL', students: 360, placed: 180 },
    { dept: 'EEE', students: 420, placed: 294 },
    { dept: 'IT', students: 320, placed: 168 },
  ],
  yearWisePlacement: [
    { year: '2020', percentage: 62 },
    { year: '2021', percentage: 68 },
    { year: '2022', percentage: 74 },
    { year: '2023', percentage: 79 },
    { year: '2024', percentage: 85 },
  ],
  outcomeData: [
    { name: 'Placed', value: 68 },
    { name: 'Higher Studies', value: 18 },
    { name: 'In Progress', value: 14 },
  ],
  topCompanies: [
    { name: 'TCS', hired: 180, package: '3.5 LPA' },
    { name: 'Infosys', hired: 145, package: '3.6 LPA' },
    { name: 'Wipro', hired: 120, package: '3.5 LPA' },
    { name: 'Cognizant', hired: 98, package: '4 LPA' },
    { name: 'HCL', hired: 87, package: '3.8 LPA' },
    { name: 'Zoho', hired: 63, package: '6 LPA' },
    { name: 'Amazon', hired: 42, package: '18 LPA' },
    { name: 'Google', hired: 12, package: '32 LPA' },
  ],
};

export async function getGrowthData(): Promise<GrowthData> {
  try {
    const snap = await getDoc(doc(db, 'growth', 'main'));
    if (snap.exists()) return snap.data() as GrowthData;
    await setDoc(doc(db, 'growth', 'main'), DEFAULT_GROWTH_DATA);
    return DEFAULT_GROWTH_DATA;
  } catch {
    return DEFAULT_GROWTH_DATA;
  }
}

