
export interface Bubble {
  id: string;
  name: string | null;
  topic: string;
  description: string | null;
  author_id: string | null;
  username: string | null;
  created_at: string | null;
  expires_at: string | null;
  reflect_count: number | null;
  size: string | null; // Keep as string to match the database schema
}
