export type MyceliumType = 'artigo' | 'video' | 'imagem' | 'audio' | 'pdf' | 'skill' | 'post' | 'site';

export type AttachmentKind = 'image' | 'video' | 'audio' | 'file';

export interface MyceliumAttachment {
  id: string;
  reference_id: string;
  storage_path: string;
  preview_path: string | null;
  kind: AttachmentKind;
  mime_type: string | null;
  size_bytes: number | null;
  sort_order: number;
}

export interface MyceliumReference {
  id: string;
  type: MyceliumType;
  title: string;
  description: string | null;
  url: string | null;
  cover_path: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  attachments?: MyceliumAttachment[];
  author?: { name: string; avatar_url: string | null } | null;
}

export const MYCELIUM_TYPES: { value: MyceliumType; label: string }[] = [
  { value: 'artigo', label: 'Artigo' },
  { value: 'video', label: 'Vídeo' },
  { value: 'imagem', label: 'Imagem' },
  { value: 'audio', label: 'Áudio' },
  { value: 'pdf', label: 'PDF' },
  { value: 'skill', label: 'Skill / Curso' },
  { value: 'post', label: 'Post social' },
  { value: 'site', label: 'Site / Ferramenta' },
];
