/**
 * Mock data types for DITS application
 * These interfaces should match the backend API contracts
 */

export type IssueStatus = 'Todo' | 'In Progress' | 'Review' | 'Done';
export type IssuePriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type LabelColor =
  | 'bug'
  | 'feature'
  | 'enhancement'
  | 'security'
  | 'database'
  | 'devops'
  | 'design';

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  labels: Label[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  areaId?: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  issueCount: number;
}

export interface Area {
  id: string;
  name: string;
  icon: string;
  issueCount: number;
}

export interface NavigationCounts {
  inbox: number;
  today: number;
  upcoming: number;
  logbook: number;
}
