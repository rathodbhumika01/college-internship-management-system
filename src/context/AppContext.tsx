import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Student,
  Faculty,
  Company,
  Internship,
  Application,
  Interview,
  Evaluation,
  StudentFeedback,
  SystemFeedback,
  RecentActivity,
  UserRole,
  ApplicationStatus,
  InternshipStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_RECENT_ACTIVITIES,
} from '../data/mockData';

// ---------------------------------------------------------------------------
// Backend connection
// ---------------------------------------------------------------------------
const API_BASE = 'http://localhost:5000/api';

// The login token. Every request sends it, and the backend checks who we are from it.
let authToken: string | null = null;

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    // token missing, expired or not valid any more: go back to the login page
    window.dispatchEvent(new Event('cims-unauthorized'));
  }
  let body: any = {};
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok || body.success === false) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}

// Ids that come from PostgreSQL are plain numbers. Mock ids look like 'std-1'.
function toDbId(id: unknown): number | null {
  const text = String(id ?? '');
  return /^\d+$/.test(text) && Number(text) > 0 ? Number(text) : null;
}

function mapCompany(c: any): Company {
  return {
    ...c,
    id: String(c.id),
    created_at: c.created_at || new Date().toISOString(),
  } as Company;
}

function mapInternship(i: any, bookmarkedIds: Set<string>): Internship {
  const id = String(i.id);
  return {
    ...i,
    id,
    company_id: String(i.company_id),
    posted_by_faculty_id: String(i.posted_by ?? ''),
    posted_by_name: i.posted_by_name || '',
    bookmarked: bookmarkedIds.has(id),
  } as unknown as Internship;
}

function mapApplication(a: any): Application {
  return {
    ...a,
    id: String(a.id),
    student_id: String(a.student_id),
    internship_id: String(a.internship_id),
    student_gpa: Number(a.student_gpa) || 0,
    resume_filename: a.resume_filename || '',
    cover_letter: a.cover_letter || '',
    qualifications: a.qualifications || '',
    faculty_feedback: a.faculty_feedback || undefined,
    timeline: a.timeline || [],
  } as Application;
}

function mapStudent(r: any): Student {
  const name = String(r.name || '');
  return {
    ...r,
    id: String(r.id),
    user_id: String(r.user_id),
    phone: r.phone || '',
    resume_filename: `${name.trim().replace(/\s+/g, '_')}_Resume.pdf`,
    resume_size_mb: 1.2,
    placed: !!r.placed,
  } as Student;
}

function mapFaculty(r: any): Faculty {
  return {
    ...r,
    id: String(r.id),
    user_id: String(r.user_id),
    phone: r.phone || '',
  } as Faculty;
}

function mapEvaluation(r: any): Evaluation {
  return {
    ...r,
    id: String(r.id),
    student_id: String(r.student_id),
    internship_id: String(r.internship_id),
    faculty_id: String(r.faculty_id ?? ''),
    created_at: r.created_at || new Date().toISOString(),
  } as Evaluation;
}

function mapStudentFeedback(r: any): StudentFeedback {
  return {
    ...r,
    id: String(r.id),
    student_id: String(r.student_id),
    internship_id: String(r.internship_id),
    company_id: String(r.company_id),
    submitted_at: r.submitted_at || new Date().toISOString(),
  } as StudentFeedback;
}

function mapSystemFeedback(r: any): SystemFeedback {
  return {
    ...r,
    id: String(r.id),
    user_id: String(r.user_id ?? 'anonymous'),
    submitted_at: r.submitted_at || new Date().toISOString(),
  } as SystemFeedback;
}

function mapInterview(r: any): Interview {
  return {
    ...r,
    id: String(r.id),
    application_id: String(r.application_id),
    student_id: String(r.student_id),
    internship_id: String(r.internship_id),
    faculty_id: String(r.faculty_id ?? ''),
    interviewer: r.interviewer || '',
    comments: r.comments || undefined,
    feedback: r.feedback || undefined,
    created_at: r.created_at || new Date().toISOString(),
  } as Interview;
}

interface AppContextType {
  currentUser: User | null;
  currentStudent: Student | null;
  currentFaculty: Faculty | null;
  users: User[];
  students: Student[];
  faculty: Faculty[];
  companies: Company[];
  internships: Internship[];
  applications: Application[];
  interviews: Interview[];
  evaluations: Evaluation[];
  studentFeedbacks: StudentFeedback[];
  systemFeedbacks: SystemFeedback[];
  recentActivities: RecentActivity[];

  // Auth
  login: (email: string, role: UserRole) => boolean;
  loginWithUser: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  registerStudentAccount: (payload: {
    full_name: string;
    email: string;
    phone: string;
    department: string;
    gpa: number;
  }) => { success: boolean; error?: string };
  registerFacultyAccount: (payload: {
    full_name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
  }) => { success: boolean; error?: string };

  // UI Notifications & Bookmarks
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  hideToast: () => void;
  toggleBookmarkInternship: (id: string) => void;

  // Student Actions
  updateStudentProfile: (studentId: string, updates: Partial<Student>) => { success: boolean; error?: string };
  applyForInternship: (
    internshipId: string,
    coverLetter: string,
    qualifications: string,
    resumeFile: { name: string; sizeMb: number }
  ) => { success: boolean; error?: string };
  withdrawApplication: (applicationId: string) => { success: boolean; error?: string };
  submitStudentFeedback: (
    internshipId: string,
    feedback: Omit<StudentFeedback, 'id' | 'student_id' | 'student_name' | 'company_name' | 'submitted_at' | 'average_rating' | 'internship_id'>
  ) => Promise<{ success: boolean; error?: string }>;

  // Faculty Actions
  createInternship: (data: Omit<Internship, 'id' | 'created_at' | 'posted_by_faculty_id' | 'posted_by_name'>) => { success: boolean; error?: string };
  updateInternship: (id: string, updates: Partial<Internship>) => { success: boolean; error?: string };
  archiveInternship: (id: string) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, feedback?: string) => void;
  scheduleInterview: (data: {
    applicationId: string;
    studentId: string;
    internshipId: string;
    date: string;
    time: string;
    interviewer: string;
    comments?: string;
  }) => { success: boolean; error?: string };
  rescheduleInterview: (id: string, newDate: string, newTime: string) => { success: boolean; error?: string };
  cancelInterview: (id: string) => void;
  updateInterviewResult: (id: string, result: 'selected' | 'rejected' | 'on_hold', feedback?: string) => void;
  submitEvaluation: (data: Omit<Evaluation, 'id' | 'created_at' | 'faculty_id' | 'faculty_name' | 'average_score'>) => Promise<{ success: boolean; error?: string }>;

  // Admin Actions
  addStudent: (data: Omit<Student, 'id' | 'user_id' | 'status'>) => { success: boolean; error?: string };
  editStudent: (id: string, updates: Partial<Student>) => { success: boolean; error?: string };
  deactivateStudent: (id: string) => void;
  addFaculty: (data: Omit<Faculty, 'id' | 'user_id' | 'status'>) => { success: boolean; error?: string };
  editFaculty: (id: string, updates: Partial<Faculty>) => { success: boolean; error?: string };
  deactivateFaculty: (id: string) => void;
  addCompany: (data: Omit<Company, 'id' | 'created_at' | 'status'>) => { success: boolean; error?: string };
  editCompany: (id: string, updates: Partial<Company>) => { success: boolean; error?: string };
  archiveCompany: (id: string) => void;
  setInternshipStatus: (id: string, status: InternshipStatus) => void;
  submitSystemFeedback: (type: SystemFeedback['feedback_type'], description: string) => { success: boolean; error?: string };
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'cims_v3_current_user',
  USERS: 'cims_v3_users',
  STUDENTS: 'cims_v3_students',
  FACULTY: 'cims_v3_faculty',
  COMPANIES: 'cims_v3_companies',
  INTERNSHIPS: 'cims_v3_internships',
  APPLICATIONS: 'cims_v3_applications',
  INTERVIEWS: 'cims_v3_interviews',
  EVALUATIONS: 'cims_v3_evaluations',
  STUDENT_FEEDBACK: 'cims_v3_student_feedback',
  SYSTEM_FEEDBACK: 'cims_v3_system_feedback',
  ACTIVITIES: 'cims_v3_activities',
  BOOKMARKS: 'cims_v3_bookmarks',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = loadStorage<User | null>(STORAGE_KEYS.USER, INITIAL_USERS[0]);
    const startUser = stored || INITIAL_USERS[0];
    authToken = (startUser as any).token || null;
    return startUser;
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  // Everything except the demo activity log comes from the database, not from mock data / localStorage
  const [companies, setCompanies] = useState<Company[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [studentFeedbacks, setStudentFeedbacks] = useState<StudentFeedback[]>([]);
  const [systemFeedbacks, setSystemFeedbacks] = useState<SystemFeedback[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(() => loadStorage(STORAGE_KEYS.ACTIVITIES, INITIAL_RECENT_ACTIVITIES));

  // Global Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const hideToast = () => setToast(null);

  // -------------------------------------------------------------------------
  // Load companies + internships from Flask
  // -------------------------------------------------------------------------
  const refreshCatalog = async () => {
    try {
      const bookmarkedIds = new Set<string>(loadStorage<string[]>(STORAGE_KEYS.BOOKMARKS, []));
      const [compRes, intRes] = await Promise.all([
        api('/companies'),
        api('/internships?status=all'),
      ]);
      setCompanies((compRes.companies || []).map(mapCompany));
      setInternships((intRes.internships || []).map((i: any) => mapInternship(i, bookmarkedIds)));
    } catch (e: any) {
      console.error('refreshCatalog failed:', e);
      showToast('Could not load data from server. Is Flask running on port 5000?', 'error');
    }
  };

  // Students only get their own applications, faculty and admin get all of them
  const refreshApplications = async () => {
    if (!currentUser) return;
    try {
      let path = '/applications';
      if (currentUser.role === 'student') {
        const myId = toDbId(currentUser.id);
        if (!myId) {
          setApplications([]);
          return;
        }
        path += `?student_id=${myId}`;
      }
      const res = await api(path);
      setApplications((res.applications || []).map(mapApplication));
    } catch (e: any) {
      console.error('refreshApplications failed:', e);
      showToast('Could not load applications from server.', 'error');
    }
  };

  // Students only get their own interviews, faculty and admin get all of them
  const refreshInterviews = async () => {
    if (!currentUser) return;
    try {
      let path = '/interviews';
      if (currentUser.role === 'student') {
        const myId = toDbId(currentUser.id);
        if (!myId) {
          setInterviews([]);
          return;
        }
        path += `?student_id=${myId}`;
      }
      const res = await api(path);
      setInterviews((res.interviews || []).map(mapInterview));
    } catch (e: any) {
      console.error('refreshInterviews failed:', e);
      showToast('Could not load interviews from server.', 'error');
    }
  };

  // Evaluations, student feedback (everyone) and system feedback (admin only)
  const refreshFeedback = async () => {
    if (!currentUser) return;
    try {
      let query = '';
      if (currentUser.role === 'student') {
        const myId = toDbId(currentUser.id);
        if (!myId) {
          setEvaluations([]);
          setStudentFeedbacks([]);
          return;
        }
        query = `?student_id=${myId}`;
      }
      const [eRes, sRes] = await Promise.all([api(`/evaluations${query}`), api(`/student-feedback${query}`)]);
      setEvaluations((eRes.evaluations || []).map(mapEvaluation));
      setStudentFeedbacks((sRes.feedback || []).map(mapStudentFeedback));
      if (currentUser.role === 'admin') {
        const yRes = await api('/system-feedback');
        setSystemFeedbacks((yRes.feedback || []).map(mapSystemFeedback));
      }
    } catch (e: any) {
      console.error('refreshFeedback failed:', e);
      showToast('Could not load feedback from server.', 'error');
    }
  };

  // Only admin and faculty need the full students / faculty lists
  const refreshPeople = async () => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'faculty')) return;
    try {
      const [sRes, fRes] = await Promise.all([api('/students'), api('/faculty')]);
      setStudents((sRes.students || []).map(mapStudent));
      setFaculty((fRes.faculty || []).map(mapFaculty));
    } catch (e: any) {
      console.error('refreshPeople failed:', e);
      showToast('Could not load students and faculty from server.', 'error');
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      authToken = null;
      setCurrentUser(prev => {
        if (prev) showToast('Your session has ended. Please log in again.', 'warning');
        return null;
      });
    };
    window.addEventListener('cims-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cims-unauthorized', handleUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // remove old mock copies saved by the previous versions
    localStorage.removeItem(STORAGE_KEYS.COMPANIES);
    localStorage.removeItem(STORAGE_KEYS.INTERNSHIPS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.INTERVIEWS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.FACULTY);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_FEEDBACK);
    localStorage.removeItem(STORAGE_KEYS.SYSTEM_FEEDBACK);
    refreshCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshApplications();
      refreshInterviews();
      refreshPeople();
      refreshFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.role]);

  const toggleBookmarkInternship = (id: string) => {
    const target = internships.find(i => i.id === id);
    if (!target) return;
    const nextVal = !(target as any).bookmarked;
    const ids = new Set<string>(loadStorage<string[]>(STORAGE_KEYS.BOOKMARKS, []));
    if (nextVal) ids.add(id);
    else ids.delete(id);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(Array.from(ids)));
    setInternships(prev => prev.map(item => (item.id === id ? { ...item, bookmarked: nextVal } : item)));
    showToast(nextVal ? 'Saved internship to your bookmarks' : 'Removed internship from bookmarks', 'info');
  };

  // Sync to localStorage (only the login and the demo activity log are kept locally now)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(recentActivities));
  }, [recentActivities]);

  // Derived current role profile.
  // Real (database) users carry their department / gpa / designation from the login response.
  const dbUserId = currentUser ? toDbId(currentUser.id) : null;
  const loginExtras: any = currentUser || {};

  const currentStudent: Student | null =
    currentUser?.role === 'student'
      ? dbUserId
        ? {
            id: String(dbUserId),
            user_id: String(dbUserId),
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone || '',
            department: loginExtras.department || '',
            gpa: Number(loginExtras.gpa) || 0,
            resume_filename: `${currentUser.name.trim().replace(/\s+/g, '_')}_Resume.pdf`,
            resume_size_mb: 1.2,
            status: 'active',
            placed: false,
          }
        : INITIAL_STUDENTS.find(s => s.email === currentUser.email) || INITIAL_STUDENTS[0]
      : null;

  const currentFaculty: Faculty | null =
    currentUser?.role === 'faculty'
      ? dbUserId
        ? {
            id: String(dbUserId),
            user_id: String(dbUserId),
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone || '',
            department: loginExtras.department || '',
            designation: loginExtras.designation || '',
            status: 'active',
          }
        : INITIAL_FACULTY.find(f => f.email === currentUser.email) || INITIAL_FACULTY[0]
      : null;

  // Add activity log
  const logActivity = (title: string, type: RecentActivity['type'], actor: string) => {
    const newAct: RecentActivity = {
      id: `act-${Date.now()}`,
      title,
      type,
      timestamp: 'Just now',
      actor,
    };
    setRecentActivities(prev => [newAct, ...prev.slice(0, 19)]);
  };

  // Auth functions
  const login = (email: string, role: UserRole): boolean => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (existing) {
      if (existing.status === 'deactivated') {
        return false;
      }
      setCurrentUser(existing);
      return true;
    }

    // Role-based matching from mock records
    if (role === 'student') {
      const std = INITIAL_STUDENTS.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (std) {
        const u: User = { id: std.user_id, email: std.email, role: 'student', name: std.name, status: 'active', created_at: new Date().toISOString() };
        setCurrentUser(u);
        return true;
      }
    } else if (role === 'faculty') {
      const fac = INITIAL_FACULTY.find(f => f.email.toLowerCase() === email.toLowerCase());
      if (fac) {
        const u: User = { id: fac.user_id, email: fac.email, role: 'faculty', name: fac.name, status: 'active', created_at: new Date().toISOString() };
        setCurrentUser(u);
        return true;
      }
    } else if (role === 'admin') {
      if (email.includes('admin')) {
        const u: User = { id: 'user-adm-1', email, role: 'admin', name: 'Placement Office Admin', status: 'active', created_at: new Date().toISOString() };
        setCurrentUser(u);
        return true;
      }
    }
    return false;
  };
  const loginWithUser = (user: User) => {
    authToken = (user as any).token || null;
    setCurrentUser({ ...user, status: 'active', created_at: new Date().toISOString() });
  };
  const logout = () => {
    authToken = null;
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (role === 'student') {
      const std = INITIAL_STUDENTS[0];
      setCurrentUser({
        id: std.user_id,
        email: std.email,
        name: std.name,
        role: 'student',
        status: 'active',
        created_at: '2026-07-15T09:00:00Z',
      });
    } else if (role === 'faculty') {
      const fac = INITIAL_FACULTY[0];
      setCurrentUser({
        id: fac.user_id,
        email: fac.email,
        name: fac.name,
        role: 'faculty',
        status: 'active',
        created_at: '2026-06-01T08:00:00Z',
      });
    } else {
      setCurrentUser({
        id: 'user-adm-1',
        email: 'admin.placement@college.edu',
        name: 'Placement Office Admin',
        role: 'admin',
        status: 'active',
        created_at: '2026-05-10T08:00:00Z',
      });
    }
  };

  const registerStudentAccount = (payload: {
    full_name: string;
    email: string;
    phone: string;
    department: string;
    gpa: number;
  }): { success: boolean; error?: string } => {
    const normalizedEmail = payload.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    if (payload.gpa < 0 || payload.gpa > 10.0) {
      return { success: false, error: 'Please enter a valid GPA between 0.00 and 10.00.' };
    }

    const cleanPhone = payload.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { success: false, error: 'Phone number must be between 10 and 15 digits.' };
    }

    const newId = `std-${Date.now()}`;
    const newUserId = `user-${newId}`;

    const newStudent: Student = {
      id: newId,
      user_id: newUserId,
      name: payload.full_name.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
      department: payload.department.trim(),
      gpa: payload.gpa,
      resume_filename: `${payload.full_name.trim().replace(/\s+/g, '_')}_Resume.pdf`,
      resume_size_mb: 1.2,
      status: 'active',
      placed: false,
    };

    const newUser: User = {
      id: newUserId,
      email: normalizedEmail,
      name: payload.full_name.trim(),
      role: 'student',
      phone: cleanPhone,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    logActivity(`New student registered: ${payload.full_name} (${payload.department})`, 'student', payload.full_name);
    return { success: true };
  };

  const registerFacultyAccount = (payload: {
    full_name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
  }): { success: boolean; error?: string } => {
    const normalizedEmail = payload.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const cleanPhone = payload.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { success: false, error: 'Phone number must be between 10 and 15 digits.' };
    }

    const newId = `fac-${Date.now()}`;
    const newUserId = `user-${newId}`;

    const newFaculty: Faculty = {
      id: newId,
      user_id: newUserId,
      name: payload.full_name.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
      department: payload.department.trim(),
      designation: payload.designation.trim(),
      status: 'active',
    };

    const newUser: User = {
      id: newUserId,
      email: normalizedEmail,
      name: payload.full_name.trim(),
      role: 'faculty',
      phone: cleanPhone,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    logActivity(`New faculty registered: ${payload.full_name}`, 'student', payload.full_name);
    return { success: true };
  };

  // Student Actions
  const updateStudentProfile = (studentId: string, updates: Partial<Student>): { success: boolean; error?: string } => {
    if (updates.gpa !== undefined && (updates.gpa < 0 || updates.gpa > 10.0)) {
      return { success: false, error: 'GPA must be between 0.00 and 10.00.' };
    }
    if (updates.phone !== undefined) {
      const cleanPhone = updates.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return { success: false, error: 'Phone number must be between 10 and 15 digits' };
      }
    }

    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, ...updates } : s))
    );

    if (currentUser && updates.name) {
      setCurrentUser(prev => prev ? { ...prev, name: updates.name! } : null);
    }

    logActivity(`Student profile updated for ${updates.name || 'student'}`, 'student', updates.name || 'Student');
    return { success: true };
  };

  const applyForInternship = (
    internshipId: string,
    coverLetter: string,
    qualifications: string,
    resumeFile: { name: string; sizeMb: number }
  ): { success: boolean; error?: string } => {
    if (!currentStudent) {
      return { success: false, error: 'You must be logged in as a student to apply.' };
    }

    // Must be a real database account (numeric user id), not a mock one
    const studentDbId = toDbId(currentStudent.user_id);
    if (!studentDbId) {
      return { success: false, error: 'Please log in with a registered student account to apply.' };
    }

    // Validation: PDF only
    if (!resumeFile.name.toLowerCase().endsWith('.pdf')) {
      return { success: false, error: 'Resume must be a PDF file only.' };
    }

    // Validation: Max 5MB
    if (resumeFile.sizeMb > 5.0) {
      return { success: false, error: 'Resume file size must not exceed 5.0 MB.' };
    }

    // Validation: Duplicate application prevention
    const existing = applications.find(
      a => a.student_id === currentStudent.id && a.internship_id === internshipId && a.status !== 'withdrawn'
    );
    if (existing) {
      return { success: false, error: 'You have already submitted an active application for this internship.' };
    }

    const internship = internships.find(i => i.id === internshipId);
    if (!internship) {
      return { success: false, error: 'Internship not found.' };
    }

    // Send to backend; the list refreshes when it finishes
    api('/applications', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentDbId,
        internship_id: Number(internshipId),
        resume_filename: resumeFile.name,
        cover_letter: coverLetter,
        qualifications,
      }),
    })
      .then(() => {
        logActivity(`Application submitted by ${currentStudent.name} for ${internship.title}`, 'application', currentStudent.name);
        showToast('Application submitted successfully.', 'success');
        return refreshApplications();
      })
      .catch((e: Error) => showToast(e.message, 'error'));

    return { success: true };
  };

  const withdrawApplication = (applicationId: string): { success: boolean; error?: string } => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    api(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'withdrawn' }),
    })
      .then(() => {
        logActivity(`Application withdrawn for ${app.internship_title}`, 'application', app.student_name);
        showToast('Application withdrawn.', 'info');
        return refreshApplications();
      })
      .catch((e: Error) => showToast(e.message, 'error'));

    return { success: true };
  };

  const submitStudentFeedback = async (
    internshipId: string,
    feedback: Omit<StudentFeedback, 'id' | 'student_id' | 'student_name' | 'company_name' | 'submitted_at' | 'average_rating' | 'internship_id'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentStudent) return { success: false, error: 'Student login required' };

    const studentDbId = toDbId(currentStudent.user_id);
    const internshipDbId = toDbId(internshipId);
    if (!studentDbId || !internshipDbId) {
      return { success: false, error: 'Please log in with a registered student account to give feedback.' };
    }

    const internship = internships.find(i => i.id === internshipId);
    if (!internship) return { success: false, error: 'Internship not found' };

    try {
      await api('/student-feedback', {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentDbId,
          internship_id: internshipDbId,
          company_culture: feedback.company_culture,
          mentorship_quality: feedback.mentorship_quality,
          technical_learning: feedback.technical_learning,
          work_environment: feedback.work_environment,
          overall_experience: feedback.overall_experience,
          comments: feedback.comments,
        }),
      });
      logActivity(`Feedback submitted for ${internship.company_name} by ${currentStudent.name}`, 'evaluation', currentStudent.name);
      refreshFeedback();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // Faculty Actions
  const createInternship = (
    data: Omit<Internship, 'id' | 'created_at' | 'posted_by_faculty_id' | 'posted_by_name'>
  ): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'faculty') {
      return { success: false, error: 'Faculty login required' };
    }

    // Must be a real database account (numeric user id), not a mock one
    const postedBy = Number(currentUser.id);
    if (!Number.isInteger(postedBy) || postedBy <= 0) {
      return { success: false, error: 'Please log in with a real faculty account to post internships.' };
    }

    // Validation: Start Date < End Date
    if (new Date(data.start_date) >= new Date(data.end_date)) {
      return { success: false, error: 'Start date must be before end date.' };
    }

    // Validation: Duration between 4 weeks and 6 months (~26 weeks)
    if (data.duration_weeks < 4 || data.duration_weeks > 26) {
      return { success: false, error: 'Internship duration must be between 4 weeks (min) and 6 months (max).' };
    }

    const companyId = Number((data as any).company_id);
    if (!Number.isInteger(companyId) || companyId <= 0) {
      return { success: false, error: 'Please choose a company from the database list.' };
    }

    const payload = { ...data, company_id: companyId, posted_by: postedBy };

    // Send to backend; the list refreshes when it finishes
    api('/internships', { method: 'POST', body: JSON.stringify(payload) })
      .then(() => {
        logActivity(`New internship posted: ${data.title} (${data.company_name})`, 'internship', currentUser.name);
        showToast('Internship submitted for admin approval.', 'success');
        return refreshCatalog();
      })
      .catch((e: Error) => showToast(e.message, 'error'));

    return { success: true };
  };

  const updateInternship = (id: string, updates: Partial<Internship>): { success: boolean; error?: string } => {
    if (updates.start_date && updates.end_date && new Date(updates.start_date) >= new Date(updates.end_date)) {
      return { success: false, error: 'Start date must be before end date.' };
    }
    if (updates.duration_weeks && (updates.duration_weeks < 4 || updates.duration_weeks > 26)) {
      return { success: false, error: 'Duration must be between 4 weeks and 6 months.' };
    }

    // No edit endpoint on the backend yet: this change lasts only until refresh
    setInternships(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)));
    return { success: true };
  };

  const archiveInternship = (id: string) => {
    setInternships(prev => prev.map(i => (i.id === id ? { ...i, status: 'archived' } : i)));
    api(`/internships/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'archived' }) })
      .catch((e: Error) => {
        showToast(e.message, 'error');
        refreshCatalog();
      });
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus, feedback?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const statusNoteMap: Record<ApplicationStatus, string> = {
      pending: 'Application marked as pending review.',
      shortlisted: 'Candidate shortlisted for interview round.',
      rejected: 'Application not selected for this position.',
      accepted: 'Candidate selected and internship offer extended.',
      withdrawn: 'Application withdrawn.',
    };

    setApplications(prev =>
      prev.map(app => {
        if (app.id !== id) return app;
        const newTimeline = [
          ...app.timeline,
          {
            status,
            date: todayStr,
            note: feedback || statusNoteMap[status],
          },
        ];
        return {
          ...app,
          status,
          faculty_feedback: feedback || app.faculty_feedback,
          timeline: newTimeline,
        };
      })
    );

    // Save to the database (only for real applications, which have numeric ids)
    if (toDbId(id)) {
      api(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, feedback }) })
        .catch((e: Error) => {
          showToast(e.message, 'error');
          refreshApplications();
        });
    }

    const targetApp = applications.find(a => a.id === id);
    if (targetApp) {
      logActivity(
        `Application for ${targetApp.student_name} updated to ${status}`,
        'application',
        currentUser?.name || 'Faculty'
      );
    }
  };

  const scheduleInterview = (data: {
    applicationId: string;
    studentId: string;
    internshipId: string;
    date: string;
    time: string;
    interviewer: string;
    comments?: string;
  }): { success: boolean; error?: string } => {
    const internship = internships.find(i => i.id === data.internshipId);
    if (!internship) return { success: false, error: 'Internship not found' };

    // Real students come from the applications list, mock ones from the students list
    const appRecord = applications.find(a => a.id === data.applicationId);
    const student =
      students.find(s => s.id === data.studentId) ||
      (appRecord
        ? ({ id: appRecord.student_id, name: appRecord.student_name, email: appRecord.student_email } as Student)
        : undefined);
    if (!student) return { success: false, error: 'Student not found' };

    // Validation: cannot schedule after application deadline
    if (new Date(data.date) > new Date(internship.application_deadline)) {
      return {
        success: false,
        error: `Interview cannot be scheduled after the application deadline (${internship.application_deadline}).`,
      };
    }

    // Validation: Require at least 24 hours notice
    const scheduledDateTime = new Date(`${data.date}T${data.time || '09:00'}`);
    const now = new Date();
    const diffHours = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return {
        success: false,
        error: 'Interviews require at least 24 hours advance notice to the student.',
      };
    }

    const facultyDbId = toDbId(currentFaculty?.user_id);
    const applicationDbId = toDbId(data.applicationId);
    if (!facultyDbId || !applicationDbId) {
      return { success: false, error: 'Please log in with a registered faculty account to schedule interviews.' };
    }

    // Send to backend; the lists refresh when it finishes
    api('/interviews', {
      method: 'POST',
      body: JSON.stringify({
        application_id: applicationDbId,
        scheduled_by: facultyDbId,
        date: data.date,
        time: data.time,
        interviewer: data.interviewer,
        comments: data.comments,
      }),
    })
      .then(() => {
        // The application moves to shortlisted once its interview is booked
        updateApplicationStatus(data.applicationId, 'shortlisted', `Interview scheduled for ${data.date} at ${data.time}`);
        logActivity(`Interview scheduled for ${student.name} with ${internship.company_name}`, 'interview', currentFaculty?.name || 'Faculty');
        showToast('Interview scheduled.', 'success');
        return refreshInterviews();
      })
      .catch((e: Error) => showToast(e.message, 'error'));

    return { success: true };
  };

  const rescheduleInterview = (id: string, newDate: string, newTime: string): { success: boolean; error?: string } => {
    const interview = interviews.find(i => i.id === id);
    if (!interview) return { success: false, error: 'Interview not found' };

    const internship = internships.find(it => it.id === interview.internship_id);
    if (internship && new Date(newDate) > new Date(internship.application_deadline)) {
      return { success: false, error: `Cannot reschedule past application deadline (${internship.application_deadline}).` };
    }

    const scheduledDateTime = new Date(`${newDate}T${newTime}`);
    const now = new Date();
    if ((scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60) < 24) {
      return { success: false, error: 'Rescheduling requires at least 24 hours advance notice.' };
    }

    api(`/interviews/${id}`, { method: 'PATCH', body: JSON.stringify({ date: newDate, time: newTime }) })
      .then(() => {
        showToast('Interview rescheduled.', 'success');
        return refreshInterviews();
      })
      .catch((e: Error) => showToast(e.message, 'error'));

    return { success: true };
  };

  const cancelInterview = (id: string) => {
    setInterviews(prev => prev.map(i => (i.id === id ? { ...i, status: 'cancelled' } : i)));
    api(`/interviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) })
      .catch((e: Error) => {
        showToast(e.message, 'error');
        refreshInterviews();
      });
  };

  const updateInterviewResult = (id: string, result: 'selected' | 'rejected' | 'on_hold', feedback?: string) => {
    setInterviews(prev =>
      prev.map(i => (i.id === id ? { ...i, result, feedback, status: 'completed' } : i))
    );
    api(`/interviews/${id}`, { method: 'PATCH', body: JSON.stringify({ result, feedback }) })
      .catch((e: Error) => {
        showToast(e.message, 'error');
        refreshInterviews();
      });

    const intv = interviews.find(i => i.id === id);
    if (intv && intv.application_id) {
      if (result === 'selected') {
        updateApplicationStatus(intv.application_id, 'accepted', feedback || 'Selected during interview round.');
      } else if (result === 'rejected') {
        updateApplicationStatus(intv.application_id, 'rejected', feedback || 'Interview round not cleared.');
      }
    }
  };

  const submitEvaluation = async (
    data: Omit<Evaluation, 'id' | 'created_at' | 'faculty_id' | 'faculty_name' | 'average_score'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentFaculty) return { success: false, error: 'Faculty login required' };

    const facultyDbId = toDbId(currentFaculty.user_id);
    const studentDbId = toDbId(data.student_id);
    const internshipDbId = toDbId(data.internship_id);
    if (!facultyDbId || !studentDbId || !internshipDbId) {
      return { success: false, error: 'Please log in with a registered faculty account and pick a registered student.' };
    }

    try {
      await api('/evaluations', {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentDbId,
          internship_id: internshipDbId,
          faculty_id: facultyDbId,
          technical_skills: data.technical_skills,
          soft_skills: data.soft_skills,
          punctuality: data.punctuality,
          responsibility: data.responsibility,
          teamwork: data.teamwork,
          learning_ability: data.learning_ability,
          comments: data.comments,
          hire_likelihood: data.hire_likelihood,
        }),
      });
      logActivity(`Evaluation submitted for ${data.student_name}`, 'evaluation', currentFaculty.name);
      refreshFeedback();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // Admin Actions
  const addStudent = (_data: Omit<Student, 'id' | 'user_id' | 'status'>): { success: boolean; error?: string } => {
    return { success: false, error: 'Students create their own account from the Create New Account page, so they can set their own password.' };
  };

  const editStudent = (id: string, updates: Partial<Student>): { success: boolean; error?: string } => {
    if (updates.gpa !== undefined && (updates.gpa < 0 || updates.gpa > 10.0)) {
      return { success: false, error: 'GPA must be between 0.00 and 10.00.' };
    }
    if (updates.phone !== undefined) {
      const cleanPhone = updates.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return { success: false, error: 'Phone must be 10-15 digits.' };
      }
    }
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    return { success: true };
  };

  const deactivateStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    if (!target) return;
    const next = target.status === 'active' ? 'deactivated' : 'active';
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, status: next } : s)));
    api(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next }) })
      .catch((e: Error) => {
        showToast(e.message, 'error');
        refreshPeople();
      });
  };

  const addFaculty = (_data: Omit<Faculty, 'id' | 'user_id' | 'status'>): { success: boolean; error?: string } => {
    return { success: false, error: 'Faculty create their own account from the Create New Account page, so they can set their own password.' };
  };

  const editFaculty = (id: string, updates: Partial<Faculty>): { success: boolean; error?: string } => {
    setFaculty(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
    return { success: true };
  };

  const deactivateFaculty = (id: string) => {
    const target = faculty.find(f => f.id === id);
    if (!target) return;
    const next = target.status === 'active' ? 'deactivated' : 'active';
    setFaculty(prev => prev.map(f => (f.id === id ? { ...f, status: next } : f)));
    api(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next }) })
      .catch((e: Error) => {
        showToast(e.message, 'error');
        refreshPeople();
      });
  };

  const addCompany = (data: Omit<Company, 'id' | 'created_at' | 'status'>): { success: boolean; error?: string } => {
    // Unique registration number check
    if (companies.some(c => c.reg_number.trim().toLowerCase() === data.reg_number.trim().toLowerCase())) {
      return { success: false, error: `Company Registration Number '${data.reg_number}' already exists in database.` };
    }

    // Save to backend; the list refreshes when it finishes
    api('/companies', { method: 'POST', body: JSON.stringify(data) })
      .then(() => {
        logActivity(`Company registered: ${data.name} (Reg: ${data.reg_number})`, 'student', 'Admin');
        showToast('Company saved.', 'success');
        return refreshCatalog();
      })
      .catch((e: Error) => showToast(e.message, 'error'));

    return { success: true };
  };

  const editCompany = (id: string, updates: Partial<Company>): { success: boolean; error?: string } => {
    if (updates.reg_number) {
      const existing = companies.find(c => c.id !== id && c.reg_number.toLowerCase() === updates.reg_number!.toLowerCase());
      if (existing) {
        return { success: false, error: 'Registration number must be unique across all companies.' };
      }
    }
    // No edit endpoint on the backend yet: this change lasts only until refresh
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    return { success: true };
  };

  const archiveCompany = (id: string) => {
    const target = companies.find(c => c.id === id);
    if (!target) return;
    const next = target.status === 'active' ? 'archived' : 'active';
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, status: next } : c)));
    api(`/companies/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next }) })
      .catch((e: Error) => {
        showToast(e.message, 'error');
        refreshCatalog();
      });
  };

  const setInternshipStatus = (id: string, status: InternshipStatus) => {
    setInternships(prev => prev.map(i => (i.id === id ? { ...i, status } : i)));
    api(`/internships/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      .catch((e: Error) => {
        showToast(e.message, 'error');
        refreshCatalog();
      });
  };

  const submitSystemFeedback = (
    type: SystemFeedback['feedback_type'],
    description: string
  ): { success: boolean; error?: string } => {
    if (!description.trim()) {
      return { success: false, error: 'Please enter a description for your feedback.' };
    }

    api('/system-feedback', {
      method: 'POST',
      body: JSON.stringify({
        user_id: currentUser ? toDbId(currentUser.id) : null,
        feedback_type: type,
        description: description.trim(),
      }),
    })
      .then(() => {
        showToast('Feedback received. Thank you.', 'success');
        return refreshFeedback();
      })
      .catch((e: Error) => showToast(e.message, 'error'));

    return { success: true };
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setStudents([]);
    setFaculty([]);
    setApplications([]);
    setInterviews([]);
    setEvaluations([]);
    setStudentFeedbacks([]);
    setSystemFeedbacks([]);
    setRecentActivities(INITIAL_RECENT_ACTIVITIES);
    refreshCatalog();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentStudent,
        currentFaculty,
        users,
        students,
        faculty,
        companies,
        internships,
        applications,
        interviews,
        evaluations,
        studentFeedbacks,
        systemFeedbacks,
        recentActivities,
        login,
        loginWithUser,
        logout,
        switchRole,
        registerStudentAccount,
        registerFacultyAccount,
        updateStudentProfile,
        applyForInternship,
        withdrawApplication,
        submitStudentFeedback,
        createInternship,
        updateInternship,
        archiveInternship,
        updateApplicationStatus,
        scheduleInterview,
        rescheduleInterview,
        cancelInterview,
        updateInterviewResult,
        submitEvaluation,
        addStudent,
        editStudent,
        deactivateStudent,
        addFaculty,
        editFaculty,
        deactivateFaculty,
        addCompany,
        editCompany,
        archiveCompany,
        setInternshipStatus,
        submitSystemFeedback,
        resetAllData,
        toast,
        showToast,
        hideToast,
        toggleBookmarkInternship,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};