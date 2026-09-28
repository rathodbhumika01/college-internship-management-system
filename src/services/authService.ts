/**
 * Auth Service - REST API Client Placeholder
 * 
 * Target Architecture:
 * Frontend (React) -> Flask REST API -> PostgreSQL
 * 
 * Endpoints represented:
 * - POST /api/auth/register/student
 * - POST /api/auth/register/faculty
 * - POST /api/auth/login
 * - POST /api/auth/forgot-password
 * 
 * Note: Password hashes and PostgreSQL interactions will be handled securely by
 * the Flask backend with bcrypt/PBKDF2. Passwords are never stored in localStorage.
 */

import {
  StudentRegisterPayload,
  FacultyRegisterPayload,
  LoginPayload,
  AuthResponse,
  User,
} from '../types';

export const authService = {
  /**
   * Register a new student
   * Future endpoint: POST /api/auth/register/student
   */
  async registerStudent(
    payload: StudentRegisterPayload,
    onSuccessHandler: (user: User) => void
  ): Promise<AuthResponse> {
    // Simulated network delay for realistic frontend loading states
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Client-side validations
    if (!payload.full_name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!payload.email.includes('@') || !payload.email.includes('.')) {
      return { success: false, error: 'Please enter a valid institutional email address.' };
    }
    if (payload.gpa < 0 || payload.gpa > 10.0) {
      return { success: false, error: 'Please enter a valid GPA between 0.00 and 10.00.' };
    }

    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email: payload.email.toLowerCase().trim(),
      name: payload.full_name.trim(),
      role: 'student',
      phone: payload.phone.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
    };

    onSuccessHandler(newUser);

    return {
      success: true,
      user: newUser,
      message: 'Student account created successfully. Please login.',
    };
  },

  /**
   * Register a new faculty coordinator / supervisor
   * Future endpoint: POST /api/auth/register/faculty
   */
  async registerFaculty(
    payload: FacultyRegisterPayload,
    onSuccessHandler: (user: User) => void
  ): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!payload.full_name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!payload.email.includes('@') || !payload.email.includes('.')) {
      return { success: false, error: 'Please enter a valid institutional email address.' };
    }
    if (!payload.designation.trim()) {
      return { success: false, error: 'Please enter your academic designation.' };
    }

    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email: payload.email.toLowerCase().trim(),
      name: payload.full_name.trim(),
      role: 'faculty',
      phone: payload.phone.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
    };

    onSuccessHandler(newUser);

    return {
      success: true,
      user: newUser,
      message: 'Faculty account created successfully. Please login.',
    };
  },

  /**
   * User authentication
   * Future endpoint: POST /api/auth/login
   */
  async login(
    payload: LoginPayload,
    authenticateFn: (email: string, role: LoginPayload['role']) => boolean
  ): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 450));

    const ok = authenticateFn(payload.email, payload.role);
    if (!ok) {
      return {
        success: false,
        error: `Invalid credentials for ${payload.role}. Please check your institutional email or use demo accounts.`,
      };
    }

    return {
      success: true,
      message: 'Authentication successful.',
    };
  },

  /**
   * Request password reset
   * Future endpoint: POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Verification link and password reset instructions have been sent to your institutional email.',
    };
  },
};
