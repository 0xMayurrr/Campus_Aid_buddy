// ── Roles ──────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'faculty' | 'hod' | 'admin';

// ── User ───────────────────────────────────────────────────────────────────
export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  dept?: string;
  year?: number;
  cgpa?: number;
  createdAt: string;
}

// ── Tickets ────────────────────────────────────────────────────────────────
export type TicketStatus = 'submitted' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory =
  | 'academic'
  | 'facility'
  | 'complaint'
  | 'service_request'
  | 'hostel'
  | 'transport'
  | 'other';

export interface Ticket {
  id: string;
  title: string;
  category: TicketCategory;
  dept: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  raisedBy: string;       // uid
  raisedByName: string;
  raisedByEmail: string;
  assignedTo?: string;
  location?: string;
  aiSummary?: string;
  aiPriority?: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

// ── Digital Library ────────────────────────────────────────────────────────
export interface LibraryItem {
  id: string;
  displayId: string; // e.g. #SVCE-VID-101
  title: string;
  type: 'video' | 'pdf' | 'doc';
  dept: string;
  year: number;
  subject: string;
  topic?: string;
  description?: string;
  uploadedBy: string;
  uploadedByName: string;
  url: string;
  createdAt: string;
}

// ── Student Profile ────────────────────────────────────────────────────────
export interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  rollNo: string;
  dept: string;
  year: number;
  cgpa: number;
  attendance: Record<string, number>; // subject -> %
  billing: {
    status: 'paid' | 'pending' | 'overdue';
    amount: number;
    dueDate: string;
  };
  semester: number;
  phone?: string;
  photoUrl?: string;
}

// ── Announcements ──────────────────────────────────────────────────────────
export interface Announcement {
  id: string;
  title: string;
  body: string;
  targetRole: UserRole | 'all';
  postedBy: string;
  postedByName: string;
  createdAt: string;
}

// ── Campus Growth ──────────────────────────────────────────────────────────
export interface DeptGrowthData {
  dept: string;
  students: number;
  placed: number;
}

export interface GrowthData {
  totalStudents: number;
  placedStudents: number;
  companies: number;
  events: number;
  facultyCount: number;
  avgCgpa: number;
  deptWiseData: DeptGrowthData[];
  yearWisePlacement: { year: string; percentage: number }[];
  outcomeData: { name: string; value: number }[];
  topCompanies: { name: string; hired: number; package: string }[];
}
