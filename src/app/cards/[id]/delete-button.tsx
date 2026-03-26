'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BusinessCard } from '@/lib/types';
import { deleteBusinessCard, deleteCardImage } from '@/lib/supabase';
import { toast } from 'sonner';

interface DeleteCardButtonProps {
  card: BusinessCard;
}

export function DeleteCardButton({ card }: DeleteCardButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (card.image_url) {
        await deleteCardImage(card.image_url);
      }
      await deleteBusinessCard(card.id);
      toast.success('名刺を削除しました');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('削除に失敗しました');
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-8 px-3 bg-destructive text-white shadow-xs hover:bg-destructive/90"
      >
        削除
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>名刺を削除しますか？</DialogTitle>
          <DialogDescription>
            「{card.name}」の名刺を削除します。この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? '削除中...' : '削除する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
