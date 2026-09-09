import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthSession } from '../types';
import { validateWithSchema, RegisterSchema, LoginSchema } from '../utils/validationSchemas';

export const DEMO_USERS: Record<UserRole, User> = {
  student: {
    id: 'usr_student_01',
    name: 'Aarav Sharma',
    email: 'student@intelligrade.edu',
    role: 'student',
    rollNumber: 'CS-2026-041',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    permissions: ['read:submissions', 'read:grades', 'read:insights', 'request:reevaluation']
  },
  teacher: {
    id: 'usr_teacher_01',
    name: 'Prof. Ananya Sen',
    email: 'teacher@intelligrade.edu',
    role: 'teacher',
    title: 'Lead Instructor & Associate Professor',
    department: 'Department of Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    permissions: ['read:all', 'write:preprocess', 'write:ocr', 'write:grades', 'override:marks', 'read:insights', 'run:batch']
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. Rajesh Kulkarni',
    email: 'admin@intelligrade.edu',
    role: 'admin',
    title: 'Dean & System Administrator',
    department: 'Office of Academic Assessment',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    permissions: ['*']
  }
};

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  rollNumber?: string;
  title?: string;
  adminKey?: string;
  teacherKey?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canEditRubrics: boolean;
  canOverrideMarks: boolean;
  canPreprocessUpload: boolean;
  canAccessArchitecture: boolean;
  canAccessUserManagement: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

interface LocalAccount {
  user: User;
  passwordHash: string;
}

const DEFAULT_ACCOUNTS: LocalAccount[] = [
  { user: DEMO_USERS.student, passwordHash: 'student123' },
  { user: DEMO_USERS.teacher, passwordHash: 'teacher123' },
  { user: DEMO_USERS.admin, passwordHash: 'admin123' }
];

const getStoredAccounts = (): LocalAccount[] => {
  try {
    const raw = localStorage.getItem('intelligrade_custom_accounts');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return [...DEFAULT_ACCOUNTS, ...parsed];
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_ACCOUNTS;
};

const saveCustomAccount = (account: LocalAccount) => {
  try {
    const raw = localStorage.getItem('intelligrade_custom_accounts');
    const existing: LocalAccount[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(a => a.user.email.toLowerCase() !== account.user.email.toLowerCase());
    filtered.push(account);
    localStorage.setItem('intelligrade_custom_accounts', JSON.stringify(filtered));
  } catch (e) {
    // ignore
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with null so user is greeted by the Login & Registration page at start
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('intelligrade_auth_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch (e) { 
        return null; 
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('intelligrade_auth_token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('intelligrade_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('intelligrade_auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('intelligrade_auth_token', token);
    } else {
      localStorage.removeItem('intelligrade_auth_token');
    }
  }, [token]);

  const login = async (email: string, password: string, role?: UserRole): Promise<{ success: boolean; error?: string }> => {
    const loginValidation = validateWithSchema(LoginSchema, { email, password, role });
    if (!loginValidation.success || !loginValidation.data) {
      return { success: false, error: loginValidation.error || 'Please provide a valid email and password.' };
    }

    const validData = loginValidation.data;
    setIsLoading(true);
    try {
      const resp = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData)
      });

      if (resp.ok) {
        const data = await resp.json();
        setUser(data.user);
        setToken(data.token);
        setIsLoading(false);
        return { success: true };
      } else {
        const err = await resp.json();
        setIsLoading(false);
        return { success: false, error: err.error || 'Authentication failed' };
      }
    } catch (e) {
      // Local fallback with STRICT role credential validation
      const accounts = getStoredAccounts();
      const match = accounts.find(a => a.user.email.toLowerCase() === validData.email.toLowerCase());

      if (!match) {
        setIsLoading(false);
        return { success: false, error: `No registered account found with email '${validData.email}'. Please register first.` };
      }
      if (match.passwordHash !== validData.password) {
        setIsLoading(false);
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }
      // Strict role validation in fallback
      if (role && match.user.role !== role) {
        const roleLabels: Record<string, string> = {
          student: 'Student',
          teacher: 'Faculty / Teacher',
          admin: 'System Administrator'
        };
        setIsLoading(false);
        return { 
          success: false, 
          error: `Access Denied: This account is registered as a ${roleLabels[match.user.role] || match.user.role}. Only ${roleLabels[role] || role} credentials are valid for this portal.` 
        };
      }

      setUser(match.user);
      setToken(`ig_local_token_${match.user.role}_${Date.now()}`);
      setIsLoading(false);
      return { success: true };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const regValidation = validateWithSchema(RegisterSchema, data);
    if (!regValidation.success || !regValidation.data) {
      return { success: false, error: regValidation.error || 'Invalid registration information.' };
    }

    const validData = regValidation.data;

    setIsLoading(true);
    try {
      const resp = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData)
      });

      if (resp.ok) {
        const resData = await resp.json();
        setUser(resData.user);
        setToken(resData.token);
        
        // Also cache locally for offline persistence
        saveCustomAccount({
          user: resData.user,
          passwordHash: validData.password
        });

        setIsLoading(false);
        return { success: true };
      } else {
        const err = await resp.json();
        setIsLoading(false);
        return { success: false, error: err.error || 'Registration failed' };
      }
    } catch (e) {
      // Local fallback with confidential role key validation
      const VALID_ADMIN_KEYS = ['ADMIN-SEC-2026', 'ADMIN-2026-KEY', 'admin123'];
      const VALID_TEACHER_KEYS = ['TEACHER-SEC-2026', 'FACULTY-2026-KEY', 'teacher123'];

      if (validData.role === 'admin' && (!validData.adminKey || !VALID_ADMIN_KEYS.includes(validData.adminKey))) {
        setIsLoading(false);
        return { success: false, error: 'Invalid Administrator Security Master Key. Security clearance code required.' };
      }

      if (validData.role === 'teacher' && (!validData.teacherKey || !VALID_TEACHER_KEYS.includes(validData.teacherKey))) {
        setIsLoading(false);
        return { success: false, error: 'Invalid Faculty Authorization Secret Key. Institutional faculty clearance required.' };
      }

      const newUser: User = {
        id: `usr_${validData.role}_${Date.now()}`,
        name: validData.name,
        email: validData.email,
        role: validData.role,
        department: validData.department || (validData.role === 'student' ? 'Computer Science & Engineering' : 'Department of Computer Science'),
        rollNumber: validData.role === 'student' ? (validData.rollNumber || `CS-2026-${Math.floor(100 + Math.random() * 900)}`) : undefined,
        title: validData.role === 'teacher' ? (validData.title || 'Faculty Instructor') : validData.role === 'admin' ? 'System Administrator' : undefined,
        permissions: validData.role === 'admin' ? ['*'] : validData.role === 'teacher' ? ['read:all', 'write:preprocess', 'write:ocr', 'write:grades', 'override:marks', 'read:insights', 'run:batch'] : ['read:submissions', 'read:grades', 'read:insights', 'request:reevaluation']
      };

      saveCustomAccount({
        user: newUser,
        passwordHash: validData.password
      });

      setUser(newUser);
      setToken(`ig_local_token_${validData.role}_${Date.now()}`);
      setIsLoading(false);
      return { success: true };
    }
  };

  const switchRole = async (newRole: UserRole) => {
    await login(undefined, undefined, newRole);
  };

  const logout = () => {
    fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    setUser(null);
    setToken(null);
  };

  const role = user?.role || 'student';
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher' || isAdmin;
  const isStudent = role === 'student';

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        hasPermission,
        canEditRubrics: isAdmin || isTeacher,
        canOverrideMarks: isAdmin || isTeacher,
        canPreprocessUpload: isAdmin || isTeacher,
        canAccessArchitecture: isAdmin || isTeacher,
        canAccessUserManagement: isAdmin,
        isStudent,
        isTeacher,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
