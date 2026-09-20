import bcrypt from 'bcryptjs';
import { SAMPLE_EXAMS, SAMPLE_SUBMISSIONS } from '../../data/sampleExams';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'admin';
  department?: string;
  rollNumber?: string;
  title?: string;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface ExamEntity {
  id: string;
  title: string;
  courseCode: string;
  subject: string;
  totalMarks: number;
  durationMinutes: number;
  gradeLevel?: string;
  instructions?: string[];
  status: 'published' | 'draft';
  questions: any[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionEntity {
  id: string;
  examId: string;
  studentId?: string;
  studentName: string;
  studentRollNo: string;
  submittedAt: string;
  status: 'UPLOADED' | 'PREPROCESSED' | 'OCR_COMPLETED' | 'GRADING' | 'COMPLETED' | 'UNDER_REVIEW' | 'FAILED';
  totalScore?: number;
  maxScore?: number;
  percentageScore?: number;
  gradeAwarded?: string;
  isFlagged?: boolean;
  pages: any[];
  evaluations?: any[];
  auditTrail?: any[];
}

export interface AuditLogEntity {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  status: 'Success' | 'Failure' | 'Blocked';
  ipAddress?: string;
  details?: any;
}

export interface SecureFileRecord {
  fileId: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  pageCount: number;
  pages: Array<{ pageNumber: number; dataUrl: string; imageId?: string; dimensions?: { width: number; height: number } }>;
  createdAt: string;
}

class InMemoryDatabase {
  private users: Map<string, UserEntity> = new Map();
  private exams: Map<string, ExamEntity> = new Map();
  private submissions: Map<string, SubmissionEntity> = new Map();
  private secureFiles: Map<string, SecureFileRecord> = new Map();
  private auditLogs: AuditLogEntity[] = [];
  private revokedTokens: Set<string> = new Set();

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase(): void {
    // 1. Seed Users
    const defaultPasswordHash = bcrypt.hashSync('student123', 10);
    const teacherPasswordHash = bcrypt.hashSync('teacher123', 10);
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);

    const initialUsers: UserEntity[] = [
      {
        id: 'usr_student_01',
        name: 'Aarav Sharma',
        email: 'student@intelligrade.edu',
        passwordHash: defaultPasswordHash,
        role: 'student',
        rollNumber: 'CS-2026-041',
        department: 'Computer Science & Engineering',
        permissions: ['read:submissions', 'read:grades', 'read:insights', 'request:reevaluation'],
        createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 2 * 3600000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_student_02',
        name: 'Priya Patel',
        email: 'priya.patel@intelligrade.edu',
        passwordHash: defaultPasswordHash,
        role: 'student',
        rollNumber: 'CS-2026-042',
        department: 'Computer Science & Engineering',
        permissions: ['read:submissions', 'read:grades', 'read:insights', 'request:reevaluation'],
        createdAt: new Date(Date.now() - 25 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 5 * 3600000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_student_03',
        name: 'Rohan Gupta',
        email: 'rohan.gupta@intelligrade.edu',
        passwordHash: defaultPasswordHash,
        role: 'student',
        rollNumber: 'EE-2026-105',
        department: 'Department of Electrical Engineering',
        permissions: ['read:submissions', 'read:grades', 'read:insights', 'request:reevaluation'],
        createdAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 24 * 3600000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_student_04',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@intelligrade.edu',
        passwordHash: defaultPasswordHash,
        role: 'student',
        rollNumber: 'CS-2026-088',
        department: 'Computer Science & Engineering',
        permissions: ['read:submissions', 'read:grades', 'read:insights', 'request:reevaluation'],
        createdAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 8 * 3600000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_student_05',
        name: 'Vikram Singh',
        email: 'vikram.singh@intelligrade.edu',
        passwordHash: defaultPasswordHash,
        role: 'student',
        rollNumber: 'ME-2026-019',
        department: 'Department of Mechanical Engineering',
        permissions: ['read:submissions', 'read:grades', 'read:insights'],
        createdAt: new Date(Date.now() - 40 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
        isActive: false
      },
      {
        id: 'usr_student_06',
        name: 'Kavita Deshmukh',
        email: 'kavita.deshmukh@intelligrade.edu',
        passwordHash: defaultPasswordHash,
        role: 'student',
        rollNumber: 'PH-2026-033',
        department: 'Department of Physics',
        permissions: ['read:submissions', 'read:grades', 'read:insights', 'request:reevaluation'],
        createdAt: new Date(Date.now() - 12 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 1 * 3600000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_teacher_01',
        name: 'Prof. Ananya Sen',
        email: 'teacher@intelligrade.edu',
        passwordHash: teacherPasswordHash,
        role: 'teacher',
        title: 'Lead Instructor & Associate Professor',
        department: 'Department of Computer Science',
        permissions: ['read:all', 'write:preprocess', 'write:ocr', 'write:grades', 'override:marks', 'read:insights', 'run:batch'],
        createdAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 1 * 3600000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_teacher_02',
        name: 'Dr. Rakesh Verma',
        email: 'prof.verma@intelligrade.edu',
        passwordHash: teacherPasswordHash,
        role: 'teacher',
        title: 'Professor & Head of Electrical Sciences',
        department: 'Department of Electrical Engineering',
        permissions: ['read:all', 'write:preprocess', 'write:ocr', 'write:grades', 'override:marks', 'read:insights', 'run:batch'],
        createdAt: new Date(Date.now() - 75 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 3 * 3600000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_teacher_03',
        name: 'Dr. Sunita Mehta',
        email: 'dr.mehta@intelligrade.edu',
        passwordHash: teacherPasswordHash,
        role: 'teacher',
        title: 'Associate Professor of Thermodynamics',
        department: 'Department of Mechanical Engineering',
        permissions: ['read:all', 'write:preprocess', 'write:ocr', 'write:grades', 'override:marks', 'read:insights'],
        createdAt: new Date(Date.now() - 50 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 10 * 3600000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_teacher_04',
        name: 'Prof. David Wilson',
        email: 'prof.wilson@intelligrade.edu',
        passwordHash: teacherPasswordHash,
        role: 'teacher',
        title: 'Senior Faculty in Computational Geometry',
        department: 'Department of Computer Science',
        permissions: ['read:all', 'write:preprocess', 'write:ocr', 'write:grades', 'override:marks'],
        createdAt: new Date(Date.now() - 35 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 6 * 3600000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_admin_01',
        name: 'Dr. Rajesh Kulkarni',
        email: 'admin@intelligrade.edu',
        passwordHash: adminPasswordHash,
        role: 'admin',
        title: 'Dean of Academic Computing & Examination Controller',
        department: 'Office of the University Registrar',
        permissions: ['read:all', 'write:all', 'admin:manage_users', 'admin:system_config', 'admin:audit_logs', 'admin:override'],
        createdAt: new Date(Date.now() - 120 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 30 * 60000).toISOString(),
        isActive: true
      },
      {
        id: 'usr_admin_02',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@intelligrade.edu',
        passwordHash: adminPasswordHash,
        role: 'admin',
        title: 'Security Officer & Systems Administrator',
        department: 'Information Security Office',
        permissions: ['read:all', 'write:all', 'admin:manage_users', 'admin:audit_logs'],
        createdAt: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
        lastLogin: new Date(Date.now() - 4 * 3600000).toISOString(),
        isActive: true
      }
    ];

    initialUsers.forEach(u => this.users.set(u.id, u));

    // 2. Seed Exams
    (SAMPLE_EXAMS || []).forEach((exam: any) => {
      this.exams.set(exam.id, {
        ...exam,
        status: exam.status || 'published',
        createdAt: exam.createdAt || new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
        updatedAt: exam.updatedAt || new Date().toISOString()
      });
    });

    // 3. Seed Submissions
    (SAMPLE_SUBMISSIONS || []).forEach((sub: any) => {
      this.submissions.set(sub.id, {
        ...sub,
        status: sub.status || 'COMPLETED',
        submittedAt: sub.submittedAt || new Date(Date.now() - 5 * 24 * 3600000).toISOString()
      });
    });

    // 4. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'log_boot_01',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        userEmail: 'admin@intelligrade.edu',
        userRole: 'admin',
        action: 'SYSTEM_BOOTSTRAP',
        resource: 'Express Production REST Architecture Engine',
        status: 'Success'
      },
      {
        id: 'log_eval_02',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        userEmail: 'teacher@intelligrade.edu',
        userRole: 'teacher',
        action: 'EVALUATE_PAPER',
        resource: 'CS301-Midterm-Aarav-Sharma',
        status: 'Success'
      },
      {
        id: 'log_auth_03',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        userEmail: 'student@intelligrade.edu',
        userRole: 'student',
        action: 'VIEW_INSIGHTS',
        resource: 'Predictive Knowledge Radar',
        status: 'Success'
      }
    ];
  }

  // User queries
  getAllUsers(): UserEntity[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): UserEntity | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): UserEntity | undefined {
    const norm = email.toLowerCase().trim();
    return Array.from(this.users.values()).find(u => u.email.toLowerCase().trim() === norm);
  }

  saveUser(user: UserEntity): UserEntity {
    this.users.set(user.id, user);
    return user;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  // Exam queries
  getAllExams(): ExamEntity[] {
    return Array.from(this.exams.values());
  }

  getExamById(id: string): ExamEntity | undefined {
    return this.exams.get(id);
  }

  saveExam(exam: ExamEntity): ExamEntity {
    this.exams.set(exam.id, exam);
    return exam;
  }

  deleteExam(id: string): boolean {
    return this.exams.delete(id);
  }

  // Submission queries
  getAllSubmissions(): SubmissionEntity[] {
    return Array.from(this.submissions.values());
  }

  getSubmissionById(id: string): SubmissionEntity | undefined {
    return this.submissions.get(id);
  }

  saveSubmission(sub: SubmissionEntity): SubmissionEntity {
    this.submissions.set(sub.id, sub);
    return sub;
  }

  deleteSubmission(id: string): boolean {
    return this.submissions.delete(id);
  }

  // Audit Log queries
  getAllAuditLogs(): AuditLogEntity[] {
    return [...this.auditLogs];
  }

  addAuditLog(log: Omit<AuditLogEntity, 'id'>): AuditLogEntity {
    const newLog: AuditLogEntity = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...log
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return newLog;
  }

  // Secure file vault queries
  getSecureFile(fileId: string): SecureFileRecord | undefined {
    return this.secureFiles.get(fileId);
  }

  saveSecureFile(record: SecureFileRecord): SecureFileRecord {
    this.secureFiles.set(record.fileId, record);
    return record;
  }

  deleteSecureFile(fileId: string): boolean {
    return this.secureFiles.delete(fileId);
  }

  // Token revocation queries
  revokeToken(token: string): void {
    this.revokedTokens.add(token);
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }
}

export const db = new InMemoryDatabase();
