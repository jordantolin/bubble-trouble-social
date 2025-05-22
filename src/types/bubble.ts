
export interface Bubble {
  id: string;
  name: string;
  topic: string;
  description: string;
  author_id: string;
  username: string;
  created_at: string;
  expires_at: string;
  reflect_count: number;
  size: number; // Changed from string to number to match the database schema
}
