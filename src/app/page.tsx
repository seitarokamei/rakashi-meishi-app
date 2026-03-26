import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CardList } from '@/components/card-list';
import { SearchBar } from '@/components/search-bar';
import { getBusinessCards } from '@/lib/supabase';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

async function CardListSection({ query }: { query?: string }) {
  const cards = await getBusinessCards(query);
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {query ? `"${query}" の検索結果: ${cards.length}件` : `${cards.length}件の名刺`}
      </p>
      <CardList cards={cards} />
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">名刺一覧</h1>
        <Link href="/cards/new">
          <Button>＋ 新規登録</Button>
        </Link>
      </div>

      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center py-16 text-muted-foreground">読み込み中...</div>
        }
      >
        <CardListSection query={q} />
      </Suspense>
    </div>
  );
}
