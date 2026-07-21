CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

GRANT USAGE ON SCHEMA cron TO postgres;

-- Orphaned menu images cleanup (bidirectional)
CREATE OR REPLACE FUNCTION cleanup_orphaned_menu_images()
RETURNS void AS $$
BEGIN
  UPDATE "Category"
  SET "image" = ''
  WHERE "image" LIKE '%menu-images%'
    AND regexp_replace("image", '.*menu-images/', '') NOT IN (
      SELECT name FROM storage.objects WHERE bucket_id = 'menu-images'
    );

  UPDATE "MenuItem"
  SET "image" = ''
  WHERE "image" LIKE '%menu-images%'
    AND regexp_replace("image", '.*menu-images/', '') NOT IN (
      SELECT name FROM storage.objects WHERE bucket_id = 'menu-images'
    );

  DELETE FROM storage.objects
  WHERE bucket_id = 'menu-images'
    AND name NOT IN (
      SELECT regexp_replace("image", '.*menu-images/', '')
      FROM "Category"
      WHERE "image" LIKE '%menu-images%' AND "image" != ''
    )
    AND name NOT IN (
      SELECT regexp_replace("image", '.*menu-images/', '')
      FROM "MenuItem"
      WHERE "image" LIKE '%menu-images%' AND "image" != ''
    )
    AND name != 'category.jpg';
END;
$$ LANGUAGE plpgsql;

-- Old served orders cleanup
CREATE OR REPLACE FUNCTION cleanup_old_served_orders()
RETURNS void AS $$
DECLARE
  ttl_hours INTEGER;
BEGIN
  SELECT COALESCE(
    (SELECT CAST(value AS INTEGER) FROM "SystemSetting" WHERE key = 'order_history_ttl_hours'),
    24
  ) INTO ttl_hours;

  DELETE FROM "Order"
  WHERE status = 'served'
    AND "servedAt" < NOW() - (ttl_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule(
  'cleanup-old-served-orders',
  '0 * * * *',
  'SELECT cleanup_old_served_orders()'
);
