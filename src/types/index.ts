export type UserRole = 'student' | 'company' | 'supervisor' | 'admin';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  school?: string;
  phone?: string;
  createdAt: any;
}

export interface AuthFormData {
  fullName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
  studentId?: string;
  department?: string;
}