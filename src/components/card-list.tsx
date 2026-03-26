import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BusinessCard } from '@/lib/types';

interface CardListProps {
  cards: BusinessCard[];
}

export function CardList({ cards }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-5xl mb-4">📇</div>
        <p className="text-lg">名刺が見つかりません</p>
        <p className="text-sm mt-1">右上の「新規登録」から名刺を追加してください</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Link key={card.id} href={`/cards/${card.id}`}>
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            {card.image_url && (
              <div className="relative w-full h-32 overflow-hidden rounded-t-lg border-b">
                <Image
                  src={card.image_url}
                  alt={`${card.name}の名刺`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base leading-tight">{card.name}</h3>
                  {card.title && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {card.title}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {card.company && (
                <p className="font-medium text-foreground truncate">{card.company}</p>
              )}
              {card.department && <p className="truncate">{card.department}</p>}
              {card.email && (
                <p className="truncate text-xs">✉ {card.email}</p>
              )}
              {card.phone && (
                <p className="text-xs">📞 {card.phone}</p>
              )}
              <p className="text-xs pt-1 text-muted-foreground/60">
                {new Date(card.created_at).toLocaleDateString('ja-JP')} 登録
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
