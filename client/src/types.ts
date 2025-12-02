export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export type APIError = string;
export type APIResponse<T> = Promise<Result<T, APIError>>;

export type Project = {
  id: number;
  name: string;
};

export type ProjectUser = {
  role: string;
  user_id: number;
  user__email: string;
  user__username: string;
};

export type Survey = {
  id: number;
  project__id: number;
  project__name: string;
  video__file: string;
  ply_file: string;
  triangles_file: string;
  triangles_prev_file: string;
  sides_file: string;
  status: string;
  created_at: string;
  scheduled_for: string;
};

export type User = {
  id: number;
  last_login: string | null;
  is_superuser: boolean;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  groups: string[];
  user_permissions: string[];
};

export type Class = {
  id: number;
  name: string;
  section: string;
  subject: string;
  student_count: number;
  teacher: {
    id: number;
    username: number;
    email: string;
    name: string;
  };
};

export type Assignment = {
  id: number;
  name: string;
  description: string;
  max_score: number;
  deadline: string;
  task_file: string;
  solution_file: string;
  submission_count: number;
  submitted: boolean;
  user_submission?: {
    id: number;
    submitted_file: string;
    submitted_at: string;
    is_hand_written: boolean;
    score: number | null;
  };
};

export type ClassDetails = {
  id: number;
  name: string;
  section: string;
  subject: string;
  student_count: number;
  invite_code: string;
  teacher: {
    id: number;
    username: number;
    email: string;
    name: string;
  };
  assignments: Assignment[];
};
