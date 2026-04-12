ALTER TABLE trips
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Rollback (si necessaire):
-- ALTER TABLE trips DROP COLUMN IF EXISTS cover_image_url;
