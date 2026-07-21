INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read menu images" ON storage.objects;
CREATE POLICY "Public read menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Admin upload menu images" ON storage.objects;
CREATE POLICY "Admin upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin update menu images" ON storage.objects;
CREATE POLICY "Admin update menu images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin delete menu images" ON storage.objects;
CREATE POLICY "Admin delete menu images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
