import {
  StudentRegisterPayload,
  FacultyRegisterPayload,
  LoginPayload,
  AuthResponse,
  User,
} from '../types';

const API_URL = 'http://127.0.0.1:5000';

export const authService = {
  async registerStudent(
    payload: StudentRegisterPayload,
    onSuccessHandler: (user: User) => void
  ): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_URL}/api/auth/register/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Could not create the account.' };
      }

      onSuccessHandler({
        id: `user-${Date.now()}`,
        email: payload.email.toLowerCase().trim(),
        name: payload.full_name.trim(),
        role: 'student',
        phone: payload.phone.trim(),
        status: 'active',
        created_at: new Date().toISOString(),
      });

      return { success: true, message: 'Student account created successfully. Please login.' };
    } catch (err) {
      return { success: false, error: 'Cannot reach the server. Please make sure the backend is running.' };
    }
  },

  async registerFaculty(
    payload: FacultyRegisterPayload,
    onSuccessHandler: (user: User) => void
  ): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_URL}/api/auth/register/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Could not create the account.' };
      }

      onSuccessHandler({
        id: `user-${Date.now()}`,
        email: payload.email.toLowerCase().trim(),
        name: payload.full_name.trim(),
        role: 'faculty',
        phone: payload.phone.trim(),
        status: 'active',
        created_at: new Date().toISOString(),
      });

      return { success: true, message: 'Faculty account created successfully. Please login.' };
    } catch (err) {
      return { success: false, error: 'Cannot reach the server. Please make sure the backend is running.' };
    }
  },

  async login(
    payload: LoginPayload,
    onSuccessHandler: (user: User) => void
  ): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      onSuccessHandler(data.user);
      return { success: true, message: 'Authentication successful.' };
    } catch (err) {
      return { success: false, error: 'Cannot reach the server. Please make sure the backend is running.' };
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Verification link and password reset instructions have been sent to your institutional email.',
    };
  },
};