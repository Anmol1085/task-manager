export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To_Do' | 'In_Progress' | 'Review' | 'Completed';
  creatorId: string;
  assignedToId: string;
  creator: User;
  assignedTo: User;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  user: User;
}