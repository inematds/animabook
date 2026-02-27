export interface SpeechBubble {
  character: string;
  text: string;
  position: 'esq' | 'dir';
  x?: number; // 0–1 fração horizontal relativa ao container
  y?: number; // 0–1 fração vertical relativa ao container
}

export interface Scene {
  imageFile: string;
  imageUrl: string;
  narrator: string;
  bubbles: SpeechBubble[];
  index: number;
  width?: number;
  height?: number;
}

export interface StoryData {
  bookId: string;
  title: string;
  scenes: Scene[];
}

export interface BookInfo {
  id: string;
  title: string;
  coverImage: string;
  sceneCount: number;
}

export type TransitionDirection = 'next' | 'prev';

export interface UserProfile {
  id: string;
  username: string;
  created_at: string;
}

export interface Publication {
  id: string;
  user_id: string;
  book_id: string;
  content: string;
  published_at: string;
  profiles?: { username: string };
  likes_count?: number;
  comments_count?: number;
  user_liked?: boolean;
}

export interface Comment {
  id: string;
  user_id: string;
  publication_id: string;
  text: string;
  created_at: string;
  profiles?: { username: string };
}
