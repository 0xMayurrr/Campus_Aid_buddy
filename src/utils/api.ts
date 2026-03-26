import axios from 'axios';

// ─── Axios Instance ────────────────────────────────────────────────────────
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth Service ──────────────────────────────────────────────────────────
export const authService = {
  register: (data: { name: string; email: string; password: string; role: string; department?: string; year?: number; rollNumber?: string }) =>
    api.post('/auth/register', data).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  getMe: () =>
    api.get('/auth/me').then((r) => r.data),
};

// ─── Issue Service ─────────────────────────────────────────────────────────
export const issueService = {
  createIssue: (data: { title: string; description: string; category?: string; department?: string; priority?: string; location?: string }) =>
    api.post('/issues', data).then((r) => r.data),

  getIssues: (dept?: string) =>
    api.get('/issues', { params: dept ? { dept } : {} }).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.put(`/issues/${id}/status`, { status }).then((r) => r.data),

  deleteIssue: (id: string) =>
    api.delete(`/issues/${id}`).then((r) => r.data),
};

// ─── Library Service ───────────────────────────────────────────────────────
export const libraryService = {
  getLibrary: (filters?: { dept?: string; year?: number; subject?: string; type?: string }) =>
    api.get('/library', { params: filters }).then((r) => r.data),

  uploadFile: (formData: FormData) =>
    api.post('/library/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),

  deleteItem: (id: string) =>
    api.delete(`/library/${id}`).then((r) => r.data),
};

// ─── AI Service ────────────────────────────────────────────────────────────
export const aiService = {
  askAI: (question: string, mode: 'pdf' | 'campus', documentText?: string) =>
    api.post('/ai/ask', { question, mode, documentText }).then((r) => r.data),

  summarizeIssue: (complaintText: string) =>
    api.post('/ai/summarize', { complaintText }).then((r) => r.data),
};

// ─── Attendance Service ────────────────────────────────────────────────────
export const attendanceService = {
  getAttendance: (studentId: string) =>
    api.get(`/attendance/student/${studentId}`).then((r) => r.data),

  getDeptAttendance: (dept?: string, year?: number) =>
    api.get('/attendance/department', { params: { dept, year } }).then((r) => r.data),

  updateAttendance: (data: { studentId: string; subject: string; department: string; year: number; present: number; total: number }) =>
    api.post('/attendance', data).then((r) => r.data),
};

// ─── Announcement Service ──────────────────────────────────────────────────
export const announcementService = {
  getAnnouncements: () =>
    api.get('/announcements').then((r) => r.data),

  createAnnouncement: (data: { title: string; body: string; targetRole?: string }) =>
    api.post('/announcements', data).then((r) => r.data),

  deleteAnnouncement: (id: string) =>
    api.delete(`/announcements/${id}`).then((r) => r.data),
};

// ─── Billing Service ───────────────────────────────────────────────────────
export const billingService = {
  getStudentBilling: (studentId: string) =>
    api.get(`/billing/student/${studentId}`).then((r) => r.data),

  createBilling: (data: { studentId: string; feeType: string; amount: number; dueDate: string }) =>
    api.post('/billing', data).then((r) => r.data),

  markPaid: (id: string) =>
    api.put(`/billing/${id}/pay`, {}).then((r) => r.data),
};
