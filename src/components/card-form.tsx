'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ImageOcrUpload } from './image-ocr-upload';
import { BusinessCard, BusinessCardInsert, OcrResult } from '@/lib/types';
import { createBusinessCard, updateBusinessCard, uploadCardImage } from '@/lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';

interface CardFormProps {
  card?: BusinessCard;
}

const EMPTY_FORM: BusinessCardInsert = {
  name: '',
  company: null,
  department: null,
  title: null,
  phone: null,
  email: null,
  address: null,
  website: null,
  notes: null,
  image_url: null,
};

export function CardForm({ card }: CardFormProps) {
  const router = useRouter();
  const isEdit = !!card;

  const [form, setForm] = useState<BusinessCardInsert>({
    name: card?.name ?? '',
    company: card?.company ?? null,
    department: card?.department ?? null,
    title: card?.title ?? null,
    phone: card?.phone ?? null,
    email: card?.email ?? null,
    address: card?.address ?? null,
    website: card?.website ?? null,
    notes: card?.notes ?? null,
    image_url: card?.image_url ?? null,
  });
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'manual' | 'ocr'>('manual');

  const set = (field: keyof BusinessCardInsert, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value || null }));
  };

  const handleOcrComplete = (result: OcrResult, file: File) => {
    setPendingFile(file);
    setForm((prev) => ({
      ...prev,
      name: result.name ?? prev.name,
      company: result.company ?? prev.company,
      department: result.department ?? prev.department,
      title: result.title ?? prev.title,
      phone: result.phone ?? prev.phone,
      email: result.email ?? prev.email,
      address: result.address ?? prev.address,
      website: result.website ?? prev.website,
    }));
    toast.success('OCR完了！内容を確認・修正してから保存してください');
    setMode('manual');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('氏名は必須です');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = form.image_url;

      if (pendingFile) {
        imageUrl = await uploadCardImage(pendingFile);
      }

      const payload = { ...form, image_url: imageUrl };

      if (isEdit) {
        await updateBusinessCard(card.id, payload);
        toast.success('名刺を更新しました');
      } else {
        await createBusinessCard(payload);
        toast.success('名刺を登録しました');
      }

      router.push('/');
      router.refresh();
    } catch {
      toast.error('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEdit && (
        <div>
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={mode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('manual')}
            >
              手入力
            </Button>
            <Button
              type="button"
              variant={mode === 'ocr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('ocr')}
            >
              画像からOCR読み取り
            </Button>
          </div>

          {mode === 'ocr' && (
            <div className="mb-4">
              <ImageOcrUpload
                onOcrComplete={handleOcrComplete}
                onError={(msg) => toast.error(msg)}
              />
            </div>
          )}
        </div>
      )}

      {form.image_url && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border">
          <Image src={form.image_url} alt="名刺画像" fill className="object-contain" />
        </div>
      )}

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">
            氏名 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="山田 太郎"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">会社名</Label>
          <Input
            id="company"
            value={form.company ?? ''}
            onChange={(e) => set('company', e.target.value)}
            placeholder="株式会社〇〇"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">部署</Label>
          <Input
            id="department"
            value={form.department ?? ''}
            onChange={(e) => set('department', e.target.value)}
            placeholder="営業部"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">役職</Label>
          <Input
            id="title"
            value={form.title ?? ''}
            onChange={(e) => set('title', e.target.value)}
            placeholder="部長"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">電話番号</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone ?? ''}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="03-1234-5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            value={form.email ?? ''}
            onChange={(e) => set('email', e.target.value)}
            placeholder="taro@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">ウェブサイト</Label>
          <Input
            id="website"
            value={form.website ?? ''}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">住所</Label>
          <Input
            id="address"
            value={form.address ?? ''}
            onChange={(e) => set('address', e.target.value)}
            placeholder="東京都千代田区〇〇1-2-3"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">メモ</Label>
          <Textarea
            id="notes"
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="会議で名刺交換、〇〇プロジェクト担当..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? '保存中...' : isEdit ? '更新する' : '登録する'}
        </Button>
      </div>
    </form>
  );
}
