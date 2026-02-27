export interface SpeechBubble {
  character: string;
  text: string;
  position: 'esq' | 'dir';
}

export interface Scene {
  imageFile: string;
  imageUrl: string;
  narrator: string;
  bubbles: SpeechBubble[];
  index: number;
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
