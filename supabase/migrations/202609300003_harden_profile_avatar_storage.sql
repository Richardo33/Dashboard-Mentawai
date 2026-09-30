-- Enforce avatar limits at the Storage layer as well as in the browser.
update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'profile-avatars';
