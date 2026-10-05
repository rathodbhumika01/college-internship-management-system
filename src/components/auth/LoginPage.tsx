import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { authService } from '../../services/authService';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const LoginPage: React.FC = () => {
  const { loginWithUser, registerStudentAccount, registerFacultyAccount } = useApp();
  // Active role selected in tab: 'student' | 'faculty' | 'admin'
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Mode: 'login' | 'register'
  // (Admin is strictly login only)
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Success / notification banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // -------------------------------------------------------------
  // LOGIN FORM STATE
  // -------------------------------------------------------------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STUDENT REGISTRATION FORM STATE
  // -------------------------------------------------------------
  const [stdName, setStdName] = useState('');
  const [stdEmail, setStdEmail] = useState('');
  const [stdPassword, setStdPassword] = useState('');
  const [stdConfirmPassword, setStdConfirmPassword] = useState('');
  const [showStdPassword, setShowStdPassword] = useState(false);
  const [showStdConfirmPassword, setShowStdConfirmPassword] = useState(false);
  const [stdPhone, setStdPhone] = useState('');
  const [stdDepartment, setStdDepartment] = useState('Computer Science & Engineering');
  const [stdGpa, setStdGpa] = useState('');
  const [isRegisteringStudent, setIsRegisteringStudent] = useState(false);
  const [stdErrors, setStdErrors] = useState<{ [key: string]: string }>({});

  // -------------------------------------------------------------
  // FACULTY REGISTRATION FORM STATE
  // -------------------------------------------------------------
  const [facName, setFacName] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facPassword, setFacPassword] = useState('');
  const [facConfirmPassword, setFacConfirmPassword] = useState('');
  const [showFacPassword, setShowFacPassword] = useState(false);
  const [showFacConfirmPassword, setShowFacConfirmPassword] = useState(false);
  const [facPhone, setFacPhone] = useState('');
  const [facDepartment, setFacDepartment] = useState('Computer Science & Engineering');
  const [facDesignation, setFacDesignation] = useState('Assistant Professor & Coordinator');
  const [isRegisteringFaculty, setIsRegisteringFaculty] = useState(false);
  const [facErrors, setFacErrors] = useState<{ [key: string]: string }>({});

  // -------------------------------------------------------------
  // FORGOT PASSWORD MODAL STATE
  // (password reset by email is not built yet, so the modal only explains that)
  // -------------------------------------------------------------
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // -------------------------------------------------------------
  // VALIDATION HELPERS
  // -------------------------------------------------------------
  const isPasswordSecure = (pwd: string): boolean => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const isEmailValid = (em: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  };

  // -------------------------------------------------------------
  // ROLE SWITCHING LOGIC
  // -------------------------------------------------------------
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError(null);
    setSuccessBanner(null);

    // Admin has NO registration, so switch immediately to login mode.
    if (role === 'admin') {
      setIsRegisterMode(false);
    }
  };

  // -------------------------------------------------------------
  // SUBMIT HANDLERS
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSuccessBanner(null);

    if (!isEmailValid(email)) {
      setLoginError('Please enter a valid institutional email.');
      return;
    }

    if (password.length < 8) {
      setLoginError('Password must contain at least 8 characters.');
      return;
    }

    setIsLoggingIn(true);

    const response = await authService.login(
      { email, password, role: selectedRole },
      (user) => loginWithUser(user)
    );

    setIsLoggingIn(false);

    if (!response.success) {
      setLoginError(response.error || `Invalid credentials for ${selectedRole}. Please check your email or password.`);
    }
  };

  const handleStudentRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!stdName.trim()) {
      errors.name = 'Please enter your full name.';
    }

    if (!isEmailValid(stdEmail)) {
      errors.email = 'Please enter a valid institutional email.';
    }

    if (!stdPassword) {
      errors.password = 'Please enter a password.';
    } else if (!isPasswordSecure(stdPassword)) {
      errors.password = 'Password must contain at least 8 characters with uppercase, lowercase, number, and symbol.';
    }

    if (stdPassword !== stdConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    const cleanPhone = stdPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      errors.phone = 'Please enter a valid phone number (10–15 digits).';
    }

    if (!stdDepartment.trim()) {
      errors.department = 'Please select or enter your department.';
    }

    const gpaNum = parseFloat(stdGpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 10.0) {
      errors.gpa = 'Please enter a valid GPA between 0 and 10.';
    }

    if (Object.keys(errors).length > 0) {
      setStdErrors(errors);
      return;
    }

    setStdErrors({});
    setIsRegisteringStudent(true);

    const res = await authService.registerStudent(
      {
        full_name: stdName.trim(),
        email: stdEmail.trim(),
        password: stdPassword,
        phone: cleanPhone,
        department: stdDepartment.trim(),
        gpa: gpaNum,
      },
      () => {
        registerStudentAccount({
          full_name: stdName.trim(),
          email: stdEmail.trim(),
          phone: cleanPhone,
          department: stdDepartment.trim(),
          gpa: gpaNum,
        });
      }
    );

    setIsRegisteringStudent(false);

    if (!res.success) {
      setStdErrors({ general: res.error || 'Failed to create student account.' });
    } else {
      // Return to Student Login with success message & prefilled email
      setSelectedRole('student');
      setEmail(stdEmail.trim());
      setPassword('');
      setIsRegisterMode(false);
      setSuccessBanner('Student account created successfully. Please login.');
      // Reset form fields
      setStdName('');
      setStdEmail('');
      setStdPassword('');
      setStdConfirmPassword('');
      setStdPhone('');
      setStdGpa('');
    }
  };

  const handleFacultyRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!facName.trim()) {
      errors.name = 'Please enter your full name.';
    }

    if (!isEmailValid(facEmail)) {
      errors.email = 'Please enter a valid institutional email.';
    }

    if (!facPassword) {
      errors.password = 'Please enter a password.';
    } else if (!isPasswordSecure(facPassword)) {
      errors.password = 'Password must contain at least 8 characters with uppercase, lowercase, number, and symbol.';
    }

    if (facPassword !== facConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    const cleanPhone = facPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      errors.phone = 'Please enter a valid phone number (10–15 digits).';
    }

    if (!facDepartment.trim()) {
      errors.department = 'Please select or enter your department.';
    }

    if (!facDesignation.trim()) {
      errors.designation = 'Please enter your academic designation.';
    }

    if (Object.keys(errors).length > 0) {
      setFacErrors(errors);
      return;
    }

    setFacErrors({});
    setIsRegisteringFaculty(true);

    const res = await authService.registerFaculty(
      {
        full_name: facName.trim(),
        email: facEmail.trim(),
        password: facPassword,
        phone: cleanPhone,
        department: facDepartment.trim(),
        designation: facDesignation.trim(),
      },
      () => {
        registerFacultyAccount({
          full_name: facName.trim(),
          email: facEmail.trim(),
          phone: cleanPhone,
          department: facDepartment.trim(),
          designation: facDesignation.trim(),
        });
      }
    );

    setIsRegisteringFaculty(false);

    if (!res.success) {
      setFacErrors({ general: res.error || 'Failed to create faculty account.' });
    } else {
      // Return to Faculty Login with success message & prefilled email
      setSelectedRole('faculty');
      setEmail(facEmail.trim());
      setPassword('');
      setIsRegisterMode(false);
      setSuccessBanner('Faculty account created successfully. Please login.');
      // Reset form fields
      setFacName('');
      setFacEmail('');
      setFacPassword('');
      setFacConfirmPassword('');
      setFacPhone('');
    }
  };

  const getLoginButtonText = () => {
    if (isLoggingIn) return 'Logging in...';
    switch (selectedRole) {
      case 'student':
        return 'Login as Student';
      case 'faculty':
        return 'Login as Faculty';
      case 'admin':
        return 'Login as Admin';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Project Branding */}
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-800 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-lg mb-3 shadow-xs">
            CI
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            College Internship Management System
          </h1>
          <p className="mt-1 text-xs text-stone-500 font-medium">
            Connect students with meaningful internship opportunities.
          </p>
        </div>

        {/* Global Success Banner */}
        {successBanner && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN AUTHENTICATION CARD                                  */}
        {/* ========================================================= */}
        <div className="mt-6 bg-white py-8 px-6 shadow-sm border border-stone-200/90 rounded-xl sm:px-10">
          {/* ALWAYS VISIBLE ROLE TABS */}
          <div className="mb-6">
            <label className="block font-semibold text-stone-800 text-xs mb-2">
              Select Your Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'faculty', 'admin'] as UserRole[]).map((r) => {
                const isActive = selectedRole === r;
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all capitalize ${
                      isActive
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* STATE A: LOGIN FORM                                     */}
          {/* ======================================================= */}
          {!isRegisterMode && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span className="leading-snug">{loginError}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@college.edu"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-800">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-700/60 rounded-lg transition-colors shadow-xs mt-2"
              >
                {getLoginButtonText()}
              </button>

              {/* Registration Option: Student and Faculty ONLY. Admin is strictly omitted. */}
              {selectedRole !== 'admin' && (
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setLoginError(null);
                        setSuccessBanner(null);
                        setIsRegisterMode(true);
                      }}
                      className="font-semibold text-slate-900 hover:underline cursor-pointer"
                    >
                      Create New Account
                    </button>
                  </p>
                </div>
              )}
            </form>
          )}

          {/* ======================================================= */}
          {/* STATE B: STUDENT REGISTRATION FORM                      */}
          {/* ======================================================= */}
          {isRegisterMode && selectedRole === 'student' && (
            <div>
              <div className="mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Create Student Account
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Register with your institutional credentials to apply for verified internships
                </p>
              </div>

              {stdErrors.general && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{stdErrors.general}</span>
                </div>
              )}

              <form onSubmit={handleStudentRegisterSubmit} className="space-y-3 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={stdName}
                    onChange={(e) => setStdName(e.target.value)}
                    placeholder="e.g. Sneha Patil"
                    className={`w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                      stdErrors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {stdErrors.name && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{stdErrors.name}</span>
                  )}
                </div>

                {/* Institutional Email */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    value={stdEmail}
                    onChange={(e) => setStdEmail(e.target.value)}
                    placeholder="student.name@college.edu"
                    className={`w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                      stdErrors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {stdErrors.email && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{stdErrors.email}</span>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showStdPassword ? 'text' : 'password'}
                      value={stdPassword}
                      onChange={(e) => setStdPassword(e.target.value)}
                      placeholder="Min 8 characters (uppercase, lowercase, number, symbol)"
                      className={`w-full pr-10 px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                        stdErrors.password ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowStdPassword(!showStdPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showStdPassword ? 'Hide password' : 'Show password'}
                    >
                      {showStdPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {stdErrors.password && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{stdErrors.password}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showStdConfirmPassword ? 'text' : 'password'}
                      value={stdConfirmPassword}
                      onChange={(e) => setStdConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full pr-10 px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                        stdErrors.confirmPassword ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowStdConfirmPassword(!showStdConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showStdConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showStdConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {stdErrors.confirmPassword && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{stdErrors.confirmPassword}</span>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={stdPhone}
                    onChange={(e) => setStdPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                      stdErrors.phone ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {stdErrors.phone && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{stdErrors.phone}</span>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Department *
                  </label>
                  <select
                    value={stdDepartment}
                    onChange={(e) => setStdDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                  {stdErrors.department && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{stdErrors.department}</span>
                  )}
                </div>

                {/* Cumulative GPA / CGPA */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Cumulative GPA / CGPA (0.00–10.00) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10.0"
                    value={stdGpa}
                    onChange={(e) => setStdGpa(e.target.value)}
                    placeholder="e.g. 8.75 or 3.85"
                    className={`w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums ${
                      stdErrors.gpa ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {stdErrors.gpa && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{stdErrors.gpa}</span>
                  )}
                </div>

                {/* Submit Primary Button */}
                <button
                  type="submit"
                  disabled={isRegisteringStudent}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-700/60 rounded-lg transition-colors shadow-xs mt-2"
                >
                  {isRegisteringStudent ? 'Creating Account...' : 'Create Student Account'}
                </button>

                {/* Return to Login */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(false);
                        setStdErrors({});
                      }}
                      className="font-semibold text-slate-900 hover:underline cursor-pointer"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================= */}
          {/* STATE C: FACULTY REGISTRATION FORM                      */}
          {/* ======================================================= */}
          {isRegisterMode && selectedRole === 'faculty' && (
            <div>
              <div className="mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Create Faculty Account
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Register as a departmental supervisor or placement coordinator
                </p>
              </div>

              {facErrors.general && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{facErrors.general}</span>
                </div>
              )}

              <form onSubmit={handleFacultyRegisterSubmit} className="space-y-3 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={facName}
                    onChange={(e) => setFacName(e.target.value)}
                    placeholder="e.g. Prof. Rajesh Kulkarni"
                    className={`w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                      facErrors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {facErrors.name && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{facErrors.name}</span>
                  )}
                </div>

                {/* Institutional Email */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    value={facEmail}
                    onChange={(e) => setFacEmail(e.target.value)}
                    placeholder="faculty.name@college.edu"
                    className={`w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                      facErrors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {facErrors.email && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{facErrors.email}</span>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showFacPassword ? 'text' : 'password'}
                      value={facPassword}
                      onChange={(e) => setFacPassword(e.target.value)}
                      placeholder="Min 8 characters (uppercase, lowercase, number, symbol)"
                      className={`w-full pr-10 px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                        facErrors.password ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowFacPassword(!showFacPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showFacPassword ? 'Hide password' : 'Show password'}
                    >
                      {showFacPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {facErrors.password && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{facErrors.password}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showFacConfirmPassword ? 'text' : 'password'}
                      value={facConfirmPassword}
                      onChange={(e) => setFacConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full pr-10 px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                        facErrors.confirmPassword ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowFacConfirmPassword(!showFacConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showFacConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showFacConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {facErrors.confirmPassword && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{facErrors.confirmPassword}</span>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={facPhone}
                    onChange={(e) => setFacPhone(e.target.value)}
                    placeholder="e.g. 9822054321"
                    className={`w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                      facErrors.phone ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {facErrors.phone && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{facErrors.phone}</span>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={facDepartment}
                    onChange={(e) => setFacDepartment(e.target.value)}
                    placeholder="e.g. Information Technology"
                    className={`w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                      facErrors.department ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {facErrors.department && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{facErrors.department}</span>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    value={facDesignation}
                    onChange={(e) => setFacDesignation(e.target.value)}
                    placeholder="e.g. Assistant Professor & Coordinator"
                    className={`w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                      facErrors.designation ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {facErrors.designation && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{facErrors.designation}</span>
                  )}
                </div>

                {/* Submit Primary Button */}
                <button
                  type="submit"
                  disabled={isRegisteringFaculty}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-700/60 rounded-lg transition-colors shadow-xs mt-2"
                >
                  {isRegisteringFaculty ? 'Creating Account...' : 'Create Faculty Account'}
                </button>

                {/* Return to Login */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(false);
                        setFacErrors({});
                      }}
                      className="font-semibold text-slate-900 hover:underline cursor-pointer"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        title="Forgot your password?"
        subtitle="Password reset"
        maxWidth="sm"
      >
        <div className="text-center py-4 space-y-3">
          <Info size={28} className="text-emerald-700 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-900">Reset by email is coming soon</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automatic password reset emails are not available yet. For now, please contact the
            placement office or your administrator to reset your password.
          </p>
          <button
            type="button"
            onClick={() => setShowForgotPasswordModal(false)}
            className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded"
          >
            Got it
          </button>
        </div>
      </Modal>
    </div>
  );
};