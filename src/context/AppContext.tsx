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
  INITIAL_COMPANIES,
  INITIAL_INTERNSHIPS,
  INITIAL_APPLICATIONS,
  INITIAL_INTERVIEWS,
  INITIAL_EVALUATIONS,
  INITIAL_STUDENT_FEEDBACK,
  INITIAL_SYSTEM_FEEDBACK,
  INITIAL_RECENT_ACTIVITIES,
} from '../data/mockData';

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
  ) => { success: boolean; error?: string };

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
  submitEvaluation: (data: Omit<Evaluation, 'id' | 'created_at' | 'faculty_id' | 'faculty_name' | 'average_score'>) => { success: boolean; error?: string };

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
    return stored || INITIAL_USERS[0];
  });
  const [students, setStudents] = useState<Student[]>(() => loadStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS));
  const [faculty, setFaculty] = useState<Faculty[]>(() => loadStorage(STORAGE_KEYS.FACULTY, INITIAL_FACULTY));
  const [companies, setCompanies] = useState<Company[]>(() => loadStorage(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES));
  const [internships, setInternships] = useState<Internship[]>(() => loadStorage(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS));
  const [applications, setApplications] = useState<Application[]>(() => loadStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS));
  const [interviews, setInterviews] = useState<Interview[]>(() => loadStorage(STORAGE_KEYS.INTERVIEWS, INITIAL_INTERVIEWS));
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => loadStorage(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS));
  const [studentFeedbacks, setStudentFeedbacks] = useState<StudentFeedback[]>(() => loadStorage(STORAGE_KEYS.STUDENT_FEEDBACK, INITIAL_STUDENT_FEEDBACK));
  const [systemFeedbacks, setSystemFeedbacks] = useState<SystemFeedback[]>(() => loadStorage(STORAGE_KEYS.SYSTEM_FEEDBACK, INITIAL_SYSTEM_FEEDBACK));
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

  const toggleBookmarkInternship = (id: string) => {
    setInternships(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextVal = !item.bookmarked;
          showToast(
            nextVal ? 'Saved internship to your bookmarks' : 'Removed internship from bookmarks',
            'info'
          );
          return { ...item, bookmarked: nextVal };
        }
        return item;
      })
    );
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(faculty));
  }, [faculty]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(internships));
  }, [internships]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
  }, [interviews]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  }, [evaluations]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_FEEDBACK, JSON.stringify(studentFeedbacks));
  }, [studentFeedbacks]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_FEEDBACK, JSON.stringify(systemFeedbacks));
  }, [systemFeedbacks]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(recentActivities));
  }, [recentActivities]);

  // Derived current role profile
  const currentStudent = currentUser?.role === 'student'
    ? students.find(s => s.email === currentUser.email) || students[0]
    : null;

  const currentFaculty = currentUser?.role === 'faculty'
    ? faculty.find(f => f.email === currentUser.email) || faculty[0]
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
      const std = students.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (std) {
        const u: User = { id: std.user_id, email: std.email, role: 'student', name: std.name, status: 'active', created_at: new Date().toISOString() };
        setCurrentUser(u);
        return true;
      }
    } else if (role === 'faculty') {
      const fac = faculty.find(f => f.email.toLowerCase() === email.toLowerCase());
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

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (role === 'student') {
      const std = students[0];
      setCurrentUser({
        id: std.user_id,
        email: std.email,
        name: std.name,
        role: 'student',
        status: 'active',
        created_at: '2026-07-15T09:00:00Z',
      });
    } else if (role === 'faculty') {
      const fac = faculty[0];
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

    setStudents(prev => [newStudent, ...prev]);
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

    setFaculty(prev => [newFaculty, ...prev]);
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

    const todayStr = new Date().toISOString().split('T')[0];

    const newApp: Application = {
      id: `app-${Date.now()}`,
      student_id: currentStudent.id,
      student_name: currentStudent.name,
      student_email: currentStudent.email,
      student_department: currentStudent.department,
      student_gpa: currentStudent.gpa,
      internship_id: internship.id,
      internship_title: internship.title,
      company_name: internship.company_name,
      resume_filename: resumeFile.name,
      cover_letter: coverLetter,
      qualifications,
      applied_date: todayStr,
      status: 'pending',
      timeline: [
        { status: 'submitted', date: todayStr, note: 'Application submitted successfully.' },
      ],
    };

    setApplications(prev => [newApp, ...prev]);
    logActivity(`Application submitted by ${currentStudent.name} for ${internship.title}`, 'application', currentStudent.name);
    return { success: true };
  };

  const withdrawApplication = (applicationId: string): { success: boolean; error?: string } => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    const todayStr = new Date().toISOString().split('T')[0];
    setApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? {
              ...a,
              status: 'withdrawn',
              timeline: [
                ...a.timeline,
                { status: 'withdrawn', date: todayStr, note: 'Application withdrawn by student.' },
              ],
            }
          : a
      )
    );
    logActivity(`Application withdrawn for ${app.internship_title}`, 'application', app.student_name);
    return { success: true };
  };

  const submitStudentFeedback = (
    internshipId: string,
    feedback: Omit<StudentFeedback, 'id' | 'student_id' | 'student_name' | 'company_name' | 'submitted_at' | 'average_rating' | 'internship_id'>
  ): { success: boolean; error?: string } => {
    if (!currentStudent) return { success: false, error: 'Student login required' };

    const internship = internships.find(i => i.id === internshipId);
    if (!internship) return { success: false, error: 'Internship not found' };

    const avg =
      (feedback.company_culture +
        feedback.mentorship_quality +
        feedback.technical_learning +
        feedback.work_environment +
        feedback.overall_experience) /
      5.0;

    const newFb: StudentFeedback = {
      id: `sfb-${Date.now()}`,
      student_id: currentStudent.id,
      student_name: currentStudent.name,
      internship_id: internship.id,
      company_name: internship.company_name,
      ...feedback,
      company_id: feedback.company_id || internship.company_id,
      average_rating: parseFloat(avg.toFixed(1)),
      submitted_at: new Date().toISOString(),
    };

    setStudentFeedbacks(prev => [newFb, ...prev]);
    logActivity(`Feedback submitted for ${internship.company_name} by ${currentStudent.name}`, 'evaluation', currentStudent.name);
    return { success: true };
  };

  // Faculty Actions
  const createInternship = (
    data: Omit<Internship, 'id' | 'created_at' | 'posted_by_faculty_id' | 'posted_by_name'>
  ): { success: boolean; error?: string } => {
    if (!currentFaculty) return { success: false, error: 'Faculty login required' };

    // Validation: Start Date < End Date
    if (new Date(data.start_date) >= new Date(data.end_date)) {
      return { success: false, error: 'Start date must be before end date.' };
    }

    // Validation: Duration between 4 weeks and 6 months (~26 weeks)
    if (data.duration_weeks < 4 || data.duration_weeks > 26) {
      return { success: false, error: 'Internship duration must be between 4 weeks (min) and 6 months (max).' };
    }

    const newInt: Internship = {
      ...data,
      id: `int-${Date.now()}`,
      posted_by_faculty_id: currentFaculty.id,
      posted_by_name: currentFaculty.name,
      created_at: new Date().toISOString(),
    };

    setInternships(prev => [newInt, ...prev]);
    logActivity(`New internship posted: ${data.title} (${data.company_name})`, 'internship', currentFaculty.name);
    return { success: true };
  };

  const updateInternship = (id: string, updates: Partial<Internship>): { success: boolean; error?: string } => {
    if (updates.start_date && updates.end_date && new Date(updates.start_date) >= new Date(updates.end_date)) {
      return { success: false, error: 'Start date must be before end date.' };
    }
    if (updates.duration_weeks && (updates.duration_weeks < 4 || updates.duration_weeks > 26)) {
      return { success: false, error: 'Duration must be between 4 weeks and 6 months.' };
    }

    setInternships(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)));
    return { success: true };
  };

  const archiveInternship = (id: string) => {
    setInternships(prev => prev.map(i => (i.id === id ? { ...i, status: 'archived' } : i)));
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

    const student = students.find(s => s.id === data.studentId);
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

    const newInterview: Interview = {
      id: `intv-${Date.now()}`,
      application_id: data.applicationId,
      student_id: student.id,
      student_name: student.name,
      student_email: student.email,
      internship_id: internship.id,
      internship_title: internship.title,
      company_name: internship.company_name,
      date: data.date,
      time: data.time,
      interviewer: data.interviewer,
      status: 'scheduled',
      result: 'pending',
      comments: data.comments,
      faculty_id: currentFaculty?.id || 'fac-1',
      created_at: new Date().toISOString(),
    };

    setInterviews(prev => [newInterview, ...prev]);

    // Also update application status to shortlisted if currently pending
    updateApplicationStatus(data.applicationId, 'shortlisted', `Interview scheduled for ${data.date} at ${data.time}`);
    logActivity(`Interview scheduled for ${student.name} with ${internship.company_name}`, 'interview', currentFaculty?.name || 'Faculty');
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

    setInterviews(prev =>
      prev.map(i => (i.id === id ? { ...i, date: newDate, time: newTime, status: 'rescheduled' } : i))
    );
    return { success: true };
  };

  const cancelInterview = (id: string) => {
    setInterviews(prev => prev.map(i => (i.id === id ? { ...i, status: 'cancelled' } : i)));
  };

  const updateInterviewResult = (id: string, result: 'selected' | 'rejected' | 'on_hold', feedback?: string) => {
    setInterviews(prev =>
      prev.map(i => (i.id === id ? { ...i, result, feedback, status: 'completed' } : i))
    );

    const intv = interviews.find(i => i.id === id);
    if (intv && intv.application_id) {
      if (result === 'selected') {
        updateApplicationStatus(intv.application_id, 'accepted', feedback || 'Selected during interview round.');
      } else if (result === 'rejected') {
        updateApplicationStatus(intv.application_id, 'rejected', feedback || 'Interview round not cleared.');
      }
    }
  };

  const submitEvaluation = (
    data: Omit<Evaluation, 'id' | 'created_at' | 'faculty_id' | 'faculty_name' | 'average_score'>
  ): { success: boolean; error?: string } => {
    if (!currentFaculty) return { success: false, error: 'Faculty login required' };

    const avg =
      (data.technical_skills +
        data.soft_skills +
        data.punctuality +
        data.responsibility +
        data.teamwork +
        data.learning_ability) /
      6.0;

    const newEval: Evaluation = {
      ...data,
      id: `eval-${Date.now()}`,
      faculty_id: currentFaculty.id,
      faculty_name: currentFaculty.name,
      average_score: parseFloat(avg.toFixed(1)),
      created_at: new Date().toISOString(),
    };

    setEvaluations(prev => [newEval, ...prev]);
    logActivity(`Evaluation submitted for ${data.student_name}`, 'evaluation', currentFaculty.name);
    return { success: true };
  };

  // Admin Actions
  const addStudent = (data: Omit<Student, 'id' | 'user_id' | 'status'>): { success: boolean; error?: string } => {
    if (students.some(s => s.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'A student with this email address already exists.' };
    }
    if (data.gpa < 0 || data.gpa > 10.0) {
      return { success: false, error: 'GPA must be between 0.00 and 10.00.' };
    }
    const cleanPhone = data.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { success: false, error: 'Phone number must be between 10 and 15 digits.' };
    }

    const newId = `std-${Date.now()}`;
    const newUserId = `user-${newId}`;
    const newStudent: Student = {
      ...data,
      id: newId,
      user_id: newUserId,
      status: 'active',
      placed: false,
    };

    const newUser: User = {
      id: newUserId,
      email: data.email,
      name: data.name,
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setStudents(prev => [newStudent, ...prev]);
    setUsers(prev => [newUser, ...prev]);
    logActivity(`New student registered: ${data.name} (${data.department})`, 'student', 'Admin');
    return { success: true };
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
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, status: s.status === 'active' ? 'deactivated' : 'active' } : s)));
  };

  const addFaculty = (data: Omit<Faculty, 'id' | 'user_id' | 'status'>): { success: boolean; error?: string } => {
    if (faculty.some(f => f.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Faculty with this email already exists.' };
    }
    const newId = `fac-${Date.now()}`;
    const newUserId = `user-${newId}`;
    const newFac: Faculty = {
      ...data,
      id: newId,
      user_id: newUserId,
      status: 'active',
    };
    const newUser: User = {
      id: newUserId,
      email: data.email,
      name: data.name,
      role: 'faculty',
      status: 'active',
      created_at: new Date().toISOString(),
    };
    setFaculty(prev => [newFac, ...prev]);
    setUsers(prev => [newUser, ...prev]);
    logActivity(`New faculty member added: ${data.name}`, 'student', 'Admin');
    return { success: true };
  };

  const editFaculty = (id: string, updates: Partial<Faculty>): { success: boolean; error?: string } => {
    setFaculty(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
    return { success: true };
  };

  const deactivateFaculty = (id: string) => {
    setFaculty(prev => prev.map(f => (f.id === id ? { ...f, status: f.status === 'active' ? 'deactivated' : 'active' } : f)));
  };

  const addCompany = (data: Omit<Company, 'id' | 'created_at' | 'status'>): { success: boolean; error?: string } => {
    // Unique registration number check
    if (companies.some(c => c.reg_number.trim().toLowerCase() === data.reg_number.trim().toLowerCase())) {
      return { success: false, error: `Company Registration Number '${data.reg_number}' already exists in database.` };
    }

    const newComp: Company = {
      ...data,
      id: `comp-${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setCompanies(prev => [newComp, ...prev]);
    logActivity(`Company registered: ${data.name} (Reg: ${data.reg_number})`, 'student', 'Admin');
    return { success: true };
  };

  const editCompany = (id: string, updates: Partial<Company>): { success: boolean; error?: string } => {
    if (updates.reg_number) {
      const existing = companies.find(c => c.id !== id && c.reg_number.toLowerCase() === updates.reg_number!.toLowerCase());
      if (existing) {
        return { success: false, error: 'Registration number must be unique across all companies.' };
      }
    }
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    return { success: true };
  };

  const archiveCompany = (id: string) => {
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, status: c.status === 'active' ? 'archived' : 'active' } : c)));
  };

  const setInternshipStatus = (id: string, status: InternshipStatus) => {
    setInternships(prev => prev.map(i => (i.id === id ? { ...i, status } : i)));
  };

  const submitSystemFeedback = (
    type: SystemFeedback['feedback_type'],
    description: string
  ): { success: boolean; error?: string } => {
    if (!description.trim()) {
      return { success: false, error: 'Please enter a description for your feedback.' };
    }

    const newFb: SystemFeedback = {
      id: `sys-${Date.now()}`,
      user_id: currentUser?.id || 'anonymous',
      user_name: currentUser?.name || 'Guest User',
      user_role: currentUser?.role || 'student',
      feedback_type: type,
      description,
      status: 'received',
      submitted_at: new Date().toISOString(),
    };

    setSystemFeedbacks(prev => [newFb, ...prev]);
    return { success: true };
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setStudents(INITIAL_STUDENTS);
    setFaculty(INITIAL_FACULTY);
    setCompanies(INITIAL_COMPANIES);
    setInternships(INITIAL_INTERNSHIPS);
    setApplications(INITIAL_APPLICATIONS);
    setInterviews(INITIAL_INTERVIEWS);
    setEvaluations(INITIAL_EVALUATIONS);
    setStudentFeedbacks(INITIAL_STUDENT_FEEDBACK);
    setSystemFeedbacks(INITIAL_SYSTEM_FEEDBACK);
    setRecentActivities(INITIAL_RECENT_ACTIVITIES);
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
