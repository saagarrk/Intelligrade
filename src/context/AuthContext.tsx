import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthSession } from '../types';

export const DEMO_USERS: Record<UserRole, User> = {
  student: {
    id: 'usr_student_01',
    name: 'Alex Rivera',
    email: 'student@intelligrade.edu',
    role: 'student',
    rollNumber: 'CS-2026-041',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    permissions: ['read:submissions', 'read:grades', 'read:insights', 'request:reevaluation']
  },
  teacher: {
    id: 'usr_teacher_01',
    name: 'Prof. Sarah Jenkins',
    email: 'teacher@intelligrade.edu',
    role: 'teacher',
    title: 'Lead Instructor & Associate Professor',
    department: 'Department of Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    permissions: ['read:all', 'write:preprocess', 'write:ocr', 'write:grades', 'override:marks', 'read:insights', 'run:batch']
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. Eleanor Vance',
    email: 'admin@intelligrade.edu',
    role: 'admin',
    title: 'Dean & System Administrator',
    department: 'Office of Academic Assessment',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    permissions: ['*']
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Teacher login so users can explore immediately, but provide full switcher
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('intelligrade_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEMO_USERS.teacher; }
    }
    return DEMO_USERS.teacher;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('intelligrade_auth_token') || 'ig_token_teacher_default';
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

  const login = async (email?: string, password?: string, role?: UserRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
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
      // Local fallback for offline mode
      const selectedRole = role || (email?.includes('admin') ? 'admin' : email?.includes('student') ? 'student' : 'teacher');
      const fallbackUser = DEMO_USERS[selectedRole];
      setUser(fallbackUser);
      setToken(`ig_local_token_${selectedRole}`);
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
