export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string | null;
  status: 'todo' | 'in-progress' | 'done';
  date: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface User {
  name: string;
  avatar: string;
  encryptionEnabled: boolean;
  password?: string;
}

export interface AppData {
  tasks: Task[];
  projects: Project[];
  user: User;
}

