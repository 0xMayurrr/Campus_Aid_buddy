/**
 * seedService.ts
 * Run this ONCE to create demo accounts in Firebase.
 * Call seedDemoUsers() from the Auth page "Seed Demo Data" button.
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'faculty' | 'hod' | 'admin';
  dept?: string;
  year?: number;
  rollNo?: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'student@campus.com',
    password: 'password123',
    name: 'Arjun Kumar',
    role: 'student',
    dept: 'CSE',
    year: 3,
    rollNo: 'CSE21001',
  },
  {
    email: 'faculty@campus.com',
    password: 'password123',
    name: 'Dr. Priya Sharma',
    role: 'faculty',
    dept: 'CSE',
  },
  {
    email: 'hod@campus.com',
    password: 'password123',
    name: 'Dr. Rajan Iyer',
    role: 'hod',
    dept: 'CSE',
  },
  {
    email: 'admin@campus.com',
    password: 'password123',
    name: 'Admin Krishnamurthy',
    role: 'admin',
  },
];

export async function seedDemoUsers(): Promise<{ success: number; skipped: number; errors: string[] }> {
  let success = 0, skipped = 0;
  const errors: string[] = [];

  for (const demo of DEMO_USERS) {
    try {
      let uid: string;
      try {
        const cred = await createUserWithEmailAndPassword(auth, demo.email, demo.password);
        uid = cred.user.uid;
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          skipped++;
          continue;
        }
        throw err;
      }

      // Write user doc
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: demo.email,
        name: demo.name,
        role: demo.role,
        dept: demo.dept || null,
        year: demo.year || null,
        cgpa: demo.role === 'student' ? 8.2 : null,
        createdAt: serverTimestamp(),
      });

      // Write student profile for student role
      if (demo.role === 'student') {
        await setDoc(doc(db, 'students', uid), {
          uid,
          name: demo.name,
          email: demo.email,
          rollNo: demo.rollNo,
          dept: demo.dept,
          year: demo.year,
          cgpa: 8.2,
          attendance: {
            'Data Structures': 82,
            'DBMS': 76,
            'Operating Systems': 91,
            'Computer Networks': 68,
            'Web Technology': 88,
            'Software Engineering': 74,
          },
          billing: {
            status: 'pending',
            amount: 45000,
            dueDate: '2025-06-30',
          },
          createdAt: serverTimestamp(),
        });
      }

      success++;
    } catch (err: any) {
      errors.push(`${demo.email}: ${err.message}`);
    }
  }

  // Seed growth data
  try {
    const growthSnap = await getDoc(doc(db, 'growth', 'main'));
    if (!growthSnap.exists()) {
      const { DEFAULT_GROWTH_DATA } = await import('./firestoreService');
      await setDoc(doc(db, 'growth', 'main'), DEFAULT_GROWTH_DATA);
    }
  } catch { /* ignore */ }

  // Seed sample announcements
  try {
    const { createAnnouncement } = await import('./firestoreService');
    await createAnnouncement({
      title: 'Anna University Exam Schedule Released',
      body: 'End semester examinations will commence from May 12, 2025. Hall tickets are available on the exam portal.',
      targetRole: 'all',
      postedBy: 'admin',
      postedByName: 'Admin Krishnamurthy',
    });
    await createAnnouncement({
      title: 'Placement Drive – TCS & Infosys',
      body: 'TCS and Infosys campus recruitment drive on April 10. Register before April 5 via Placement Cell portal.',
      targetRole: 'student',
      postedBy: 'admin',
      postedByName: 'Admin Krishnamurthy',
    });
    await createAnnouncement({
      title: 'Faculty Development Programme',
      body: 'FDP on AI/ML for faculty members from April 20–25. Register via the FDP portal.',
      targetRole: 'faculty',
      postedBy: 'admin',
      postedByName: 'Admin Krishnamurthy',
    });
  } catch { /* ignore */ }

  return { success, skipped, errors };
}
