-- Remove legacy base64 avatars from auth metadata.
-- Avatar files now live in public.profiles.avatar_path and Storage.
update auth.users
set raw_user_meta_data = raw_user_meta_data - 'avatar' - 'avatar_url'
where coalesce(raw_user_meta_data ->> 'avatar', '') like 'data:%'
   or coalesce(raw_user_meta_data ->> 'avatar_url', '') like 'data:%';
