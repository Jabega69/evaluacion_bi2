export type Role = 'admin' | 'tribunal' | 'tutor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Student {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  students: Student[];
  tribunalIds: string[]; // 3 IDs needed
  tutorId: string;
  presentationDate?: string;
  presentationLocation?: string;
}

// Rubric Structures

export interface RubricItem {
  id: string;
  label: string;
  maxScore: number;
  description?: string;
}

export interface WrittenRubric {
  contentItems: RubricItem[]; // 13 items, 0-10 score
  formatItems: RubricItem[];  // 6 items, Yes/No (1/0)
}

export interface OralRubric {
  blocks: RubricItem[]; // Presentation, Structure, etc.
  timeRanges: {
    min: number;
    max: number;
    score: number;
    label: string;
  }[];
}

export interface TutorRubric {
  items: RubricItem[]; // 5 items, 0-2 score
}

// Evaluation Submissions

export interface WrittenEvaluation {
  id: string;
  projectId: string;
  studentId: string; // NEW: Individual
  graderId: string;
  contentScores: Record<string, number>; // itemId -> score
  formatScores: Record<string, boolean>; // itemId -> passed?
  feedback?: string;
  submittedAt: string;
}

export interface OralEvaluation {
  id: string;
  projectId: string;
  studentId: string; // NEW: Individual
  graderId: string;
  blockScores: Record<string, number>;
  timeScore: number;
  feedback?: string;
  submittedAt: string;
}

export interface TutorEvaluation {
  id: string;
  projectId: string;
  studentId: string; // Already implicitly individual, making it explicit
  tutorId: string;
  scores: Record<string, number>;
  feedback?: string;
  submittedAt: string;
}
