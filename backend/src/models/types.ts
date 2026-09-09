export interface BackendUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'admin';
  department?: string;
  rollNumber?: string;
  title?: string;
  permissions: string[];
}

export interface BackendSession {
  user: BackendUser;
  expiresAt: number;
}

export interface BackendExam {
  id: string;
  title: string;
  subject: string;
  totalMarks: number;
  questions: Array<{
    id: string;
    questionNumber: number;
    questionText: string;
    maxMarks: number;
    modelAnswer: string;
    topic: string;
    keyConcepts: Array<{
      concept: string;
      weightMarks: number;
      synonyms: string[];
      description: string;
    }>;
  }>;
}
