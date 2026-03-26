import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardForm } from '@/components/card-form';
import { getBusinessCard } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCardPage({ params }: PageProps) {
  const { id } = await params;
  const card = await getBusinessCard(id).catch(() => null);
  if (!card) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/cards/${id}`}>
          <Button variant="outline" size="sm">← 戻る</Button>
        </Link>
        <h1 className="text-2xl font-bold">名刺を編集</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{card.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardForm card={card} />
        </CardContent>
      </Card>
    </div>
  );
}
