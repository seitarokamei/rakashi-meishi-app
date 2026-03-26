import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getBusinessCard } from '@/lib/supabase';
import { DeleteCardButton } from './delete-button';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
}

function InfoRow({ label, value, href }: { label: string; value: string | null; href?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {href ? (
        <a href={href} className="text-sm hover:underline text-primary" target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : (
        <span className="text-sm">{value}</span>
      )}
    </div>
  );
}

export default async function CardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const card = await getBusinessCard(id).catch(() => null);
  if (!card) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">← 一覧へ</Button>
          </Link>
          <h1 className="text-2xl font-bold">名刺詳細</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/cards/${card.id}/edit`}>
            <Button variant="outline" size="sm">編集</Button>
          </Link>
          <DeleteCardButton card={card} />
        </div>
      </div>

      <Card>
        {card.image_url && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg border-b">
            <Image src={card.image_url} alt="名刺画像" fill className="object-contain" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start gap-3">
            <div>
              <CardTitle className="text-xl">{card.name}</CardTitle>
              {card.title && (
                <Badge variant="secondary" className="mt-1">{card.title}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="会社名" value={card.company} />
            <InfoRow label="部署" value={card.department} />
            <InfoRow label="電話番号" value={card.phone} href={card.phone ? `tel:${card.phone}` : undefined} />
            <InfoRow label="メールアドレス" value={card.email} href={card.email ? `mailto:${card.email}` : undefined} />
            <InfoRow label="住所" value={card.address} />
            <InfoRow label="ウェブサイト" value={card.website} href={card.website ?? undefined} />
          </div>

          {card.notes && (
            <>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">メモ</span>
                <p className="text-sm mt-1 whitespace-pre-wrap">{card.notes}</p>
              </div>
            </>
          )}

          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>登録日: {new Date(card.created_at).toLocaleString('ja-JP')}</p>
            <p>更新日: {new Date(card.updated_at).toLocaleString('ja-JP')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
