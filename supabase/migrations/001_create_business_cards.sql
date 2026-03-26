-- business_cardsテーブルの作成
CREATE TABLE IF NOT EXISTS business_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  department TEXT,
  title TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_cards_updated_at
  BEFORE UPDATE ON business_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) を有効化
ALTER TABLE business_cards ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み書きできるポリシー（認証なしで使う場合）
-- 本番環境では認証に合わせて変更してください
CREATE POLICY "Allow all operations" ON business_cards
  FOR ALL USING (true) WITH CHECK (true);

-- 名刺画像用のStorageバケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-card-images', 'business-card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storageのポリシー
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-card-images');

CREATE POLICY "Allow upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'business-card-images');

CREATE POLICY "Allow delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'business-card-images');
