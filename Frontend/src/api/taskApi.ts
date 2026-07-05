type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role?: string;
};

export type TaskItem = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  userId: number;
};

type BackendTaskDto = {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  assignedToUserId?: number | null;
  tags?: string | null;
};

const API_BASE_URL = 'http://localhost:5074';

const getHeaders = (user: User | null) => {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (user) {
    headers.set('X-User-Role', user.role ?? 'user');
    headers.set('X-User-Id', String(user.id));
  }
  return headers;
};

const toFrontendTask = (task: BackendTaskDto): TaskItem => ({
  id: task.id,
  title: task.title,
  description: task.description ?? '',
  completed: (task.status ?? '').toLowerCase() === 'completed',
  dueDate: task.dueDate ?? null,
  userId: task.assignedToUserId ?? 0
});

export async function listTasks(user: User | null): Promise<TaskItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    headers: getHeaders(user)
  });

  if (!response.ok) {
    throw new Error('Unable to load tasks.');
  }

  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : payload.items ?? [];
  return items.map(toFrontendTask);
}

export async function createTask(task: { title: string; description: string; completed: boolean; dueDate: string }, user: User | null): Promise<TaskItem> {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: getHeaders(user),
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      status: task.completed ? 'Completed' : 'ToDo',
      priority: 'Medium',
      dueDate: task.dueDate,
      assignedToUserId: user?.id
    })
  });

  if (!response.ok) {
    throw new Error('Unable to create task.');
  }

  const createdTask = await response.json();
  return toFrontendTask(createdTask);
}

export async function updateTask(task: TaskItem, user: User | null): Promise<TaskItem> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${task.id}`, {
    method: 'PUT',
    headers: getHeaders(user),
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      status: task.completed ? 'Completed' : 'ToDo',
      priority: 'Medium',
      dueDate: task.dueDate,
      assignedToUserId: user?.id
    })
  });

  if (!response.ok) {
    throw new Error('Unable to update task.');
  }

  const updatedTask = await response.json().catch(() => null);
  return updatedTask ? toFrontendTask(updatedTask) : task;
}

export async function deleteTask(taskId: number, user: User | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders(user)
  });

  if (!response.ok) {
    throw new Error('Unable to delete task.');
  }
}

export async function getTaskById(taskId: number, user: User | null): Promise<TaskItem | null> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    headers: getHeaders(user)
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Unable to load task details.');
  }

  const task = await response.json();
  return toFrontendTask(task);
}
