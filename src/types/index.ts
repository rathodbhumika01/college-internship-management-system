/**
 * Entity Types for College Internship Management System
 * Production data structures for students, faculty, companies, internships, applications, and interviews
 */

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  password_hash?: string;
  status: 'active' | 'deactivated';
  created_at: string;
  updated_at?: string;
}

export interface StudentRegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  gpa: number; // 0.00 to 10.00
}

export interface FacultyRegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  designation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

export interface StudentAcademicInfo {
  degree: string;
  college: string;
  semester: string;
  graduation_year: string;
}

export interface StudentPreferences {
  preferred_roles: string[];
  preferred_work_mode: string;
  preferred_locations: string[];
  min_stipend: number;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  gpa: number; // 0.00 to 10.00 scale (CGPA/GPA)
  resume_filename?: string;
  resume_size_mb?: number;
  resume_url?: string;
  status: 'active' | 'deactivated';
  placed?: boolean;
  placed_company?: string;
  academic_info?: StudentAcademicInfo;
  skills?: string[];
  preferences?: StudentPreferences;
}

export interface Faculty {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: 'active' | 'deactivated';
}

export interface Company {
  id: string;
  name: string;
  reg_number: string; // Unique registration number
  location: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  industry: string;
  website?: string;
  status: 'active' | 'archived';
  created_at: string;
}

export type InternshipStatus = 'pending_approval' | 'approved' | 'rejected' | 'closed' | 'archived';

export interface Internship {
  id: string;
  title: string;
  company_id: string;
  company_name: string;
  description: string;
  domain: string; // e.g., 'Web Development', 'AI/ML', 'Data Science', 'Core Engineering'
  duration: string; // e.g., '3 months' (min 4 weeks, max 6 months)
  duration_weeks: number;
  stipend: number; // in INR e.g., 25000
  location: string;
  work_mode: 'Remote' | 'Hybrid' | 'On-site';
  internship_type?: string; // 'Full-time' | 'Part-time' | 'Summer'
  skills: string[];
  responsibilities?: string[];
  eligibility?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  application_deadline: string; // YYYY-MM-DD
  posted_by_faculty_id: string;
  posted_by_name: string;
  status: InternshipStatus;
  company_info?: string;
  created_at: string;
  bookmarked?: boolean;
}

export type ApplicationStatus = 'pending' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';

export interface ApplicationTimelineItem {
  status: ApplicationStatus | 'submitted';
  date: string;
  note: string;
}

export interface Application {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_department: string;
  student_gpa: number;
  internship_id: string;
  internship_title: string;
  company_name: string;
  resume_filename: string;
  cover_letter: string;
  qualifications: string;
  applied_date: string;
  status: ApplicationStatus;
  timeline: ApplicationTimelineItem[];
  faculty_feedback?: string;
}

export type InterviewStatus = 'scheduled' | 'rescheduled' | 'completed' | 'cancelled';
export type InterviewResult = 'pending' | 'selected' | 'rejected' | 'on_hold';

export interface Interview {
  id: string;
  application_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  internship_id: string;
  internship_title: string;
  company_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  interviewer: string;
  status: InterviewStatus;
  result: InterviewResult;
  feedback?: string;
  comments?: string;
  faculty_id: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  student_id: string;
  student_name: string;
  internship_id: string;
  internship_title: string;
  company_name: string;
  faculty_id: string;
  faculty_name: string;
  // 1 to 5 criteria
  technical_skills: number;
  soft_skills: number;
  punctuality: number;
  responsibility: number;
  teamwork: number;
  learning_ability: number;
  average_score: number;
  comments: string;
  hire_likelihood: 'high' | 'moderate' | 'low';
  created_at: string;
}

export interface StudentFeedback {
  id: string;
  student_id: string;
  student_name: string;
  internship_id: string;
  company_id: string;
  company_name: string;
  company_culture: number; // 1-5
  mentorship_quality: number; // 1-5
  technical_learning: number; // 1-5
  work_environment: number; // 1-5
  overall_experience: number; // 1-5
  average_rating: number;
  comments: string;
  submitted_at: string;
}

export type SystemFeedbackType = 'feature_request' | 'bug_report' | 'suggestion' | 'other';

export interface SystemFeedback {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  feedback_type: SystemFeedbackType;
  description: string;
  status: 'received' | 'under_review' | 'resolved';
  submitted_at: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  type: 'student' | 'internship' | 'application' | 'interview' | 'evaluation';
  timestamp: string;
  actor: string;
}
