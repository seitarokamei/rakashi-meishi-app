export interface BusinessCard {
  id: string;
  name: string;
  company: string | null;
  department: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type BusinessCardInsert = Omit<BusinessCard, 'id' | 'created_at' | 'updated_at'>;
export type BusinessCardUpdate = Partial<BusinessCardInsert>;

export interface OcrResult {
  name?: string;
  company?: string;
  department?: string;
  title?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}
