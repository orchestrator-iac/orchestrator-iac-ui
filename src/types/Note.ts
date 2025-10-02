export interface Note {
  id: string;
  content: string; // HTML produced by Tiptap
  plainText?: string; // optional plain text version for search/index
  createdAt: Date;
  updatedAt: Date;
}