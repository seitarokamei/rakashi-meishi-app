import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardForm } from '@/components/card-form';

export default function NewCardPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">← 戻る</Button>
        </Link>
        <h1 className="text-2xl font-bold">名刺を登録</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>名刺情報入力</CardTitle>
        </CardHeader>
        <CardContent>
          <CardForm />
        </CardContent>
      </Card>
    </div>
  );
}
