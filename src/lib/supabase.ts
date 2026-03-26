import { createClient } from '@supabase/supabase-js';
import { BusinessCard, BusinessCardInsert, BusinessCardUpdate } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLE = 'business_cards';
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'business-card-images';

// 一覧取得（検索対応）
export async function getBusinessCards(query?: string): Promise<BusinessCard[]> {
  let req = supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (query && query.trim()) {
    const q = `%${query.trim()}%`;
    req = req.or(
      `name.ilike.${q},company.ilike.${q},title.ilike.${q},email.ilike.${q},phone.ilike.${q},address.ilike.${q}`
    );
  }

  const { data, error } = await req;
  if (error) throw error;
  return data as BusinessCard[];
}

// 単件取得
export async function getBusinessCard(id: string): Promise<BusinessCard | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as BusinessCard;
}

// 登録
export async function createBusinessCard(card: BusinessCardInsert): Promise<BusinessCard> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(card)
    .select()
    .single();
  if (error) throw error;
  return data as BusinessCard;
}

// 更新
export async function updateBusinessCard(id: string, card: BusinessCardUpdate): Promise<BusinessCard> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(card)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as BusinessCard;
}

// 削除
export async function deleteBusinessCard(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

// 画像アップロード
export async function uploadCardImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

// 画像削除
export async function deleteCardImage(imageUrl: string): Promise<void> {
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  const fileName = pathParts[pathParts.length - 1];

  const { error } = await supabase.storage.from(BUCKET).remove([fileName]);
  if (error) console.error('画像削除エラー:', error);
}
