-- ============================================
-- Animabook v3.0.0 - Migration SQL
-- Rodar no Supabase SQL Editor
-- ============================================

-- 1. Adicionar role na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- 2. Tabela books
CREATE TABLE IF NOT EXISTS books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  synopsis text,
  story_content text,
  cover_asset_id uuid,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid NOT NULL REFERENCES auth.users(id),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Tabela book_assets
CREATE TABLE IF NOT EXISTS book_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  filename text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  width int,
  height int,
  sort_order int NOT NULL DEFAULT 0,
  kind text NOT NULL DEFAULT 'scene',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Tabela book_ingests (log de uploads)
CREATE TABLE IF NOT EXISTS book_ingests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  upload_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  source_path text,
  error_message text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- 5. FK da capa (após criar book_assets)
ALTER TABLE books
  ADD CONSTRAINT fk_cover_asset
  FOREIGN KEY (cover_asset_id) REFERENCES book_assets(id)
  ON DELETE SET NULL;

-- 6. Índices
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_book_assets_book_id ON book_assets(book_id);
CREATE INDEX IF NOT EXISTS idx_book_assets_sort ON book_assets(book_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_book_ingests_book_id ON book_ingests(book_id);

-- 7. RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_ingests ENABLE ROW LEVEL SECURITY;

-- Leitura pública de livros publicados
CREATE POLICY "books_public_read" ON books
  FOR SELECT USING (status = 'published');

-- Admin pode tudo em books
CREATE POLICY "books_admin_all" ON books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Leitura pública de assets de livros publicados
CREATE POLICY "book_assets_public_read" ON book_assets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM books WHERE id = book_assets.book_id AND status = 'published')
  );

-- Admin pode tudo em book_assets
CREATE POLICY "book_assets_admin_all" ON book_assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin pode tudo em book_ingests
CREATE POLICY "book_ingests_admin_all" ON book_ingests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. Storage bucket para assets públicos
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-assets', 'book-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: admin pode upload
CREATE POLICY "book_assets_storage_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'book-assets'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: admin pode deletar
CREATE POLICY "book_assets_storage_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'book-assets'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: leitura pública do bucket
CREATE POLICY "book_assets_storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-assets');
