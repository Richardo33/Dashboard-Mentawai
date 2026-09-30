# Supabase setup

## Objects created

- 8 public tables: `profiles`, `dashboard_config`, `taxpayers`, `transactions`, `sptpd_records`, `mpos_devices`, `stpd_records`, and `alerts`.
- 2 storage buckets:
  - `taxpayer-images` - public read access for WP images.
  - `profile-avatars` - private bucket; users can access only their own avatar folder.
- Auth profile trigger: every new Auth user receives a row in `public.profiles` with the `Administrator` role by default.
- RLS is enabled on every public table.

## Apply dari Supabase Dashboard

CLI tidak wajib. Untuk menjalankan semuanya dari Chrome:

1. Buka project Supabase `Dashboard-Mentawai`.
2. Masuk ke **SQL Editor** lalu buat query baru.
3. Buka file `supabase/migrations/202609290001_initial_schema.sql`, salin seluruh isinya, lalu jalankan.
4. Buat query baru lagi, jalankan `supabase/migrations/202609300001_add_fraud_detection_fields.sql`.
5. Buat query baru lagi, jalankan `supabase/migrations/202609300002_harden_rls_by_role.sql`.
6. Buat query baru lagi, jalankan `supabase/migrations/202609300003_harden_profile_avatar_storage.sql`.
7. Buat query baru lagi, buka file `supabase/seed.sql`, salin seluruh isinya, lalu jalankan.
8. Cek hasilnya di **Table Editor**, **Storage**, dan **Authentication > Users**.

Jalankan migration terlebih dahulu, baru seed. Migration awal membuat tabel, RLS, Auth trigger, dan bucket. Migration fraud menambahkan field operasional untuk deteksi anomaly. Migration role memperketat akses Viewer/Operator/Administrator. Migration avatar membatasi ukuran dan tipe file avatar di Storage. Seed mengisi data dummy serta akun admin.

## Apply with Supabase CLI (opsional)

Supabase CLI hanya diperlukan jika ingin menjalankan migration dari terminal, memakai database lokal, atau mengotomatisasi deployment. Ini bukan server database baru; database tetap berada di project Supabase.

From the project directory:

```bash
npm install supabase --save-dev
npx supabase login
npx supabase link --project-ref ztrvvmvufbgjhyfjsmpx
npx supabase db push --dry-run
npx supabase db push --include-seed
```

Urutan CLI-nya adalah:

1. `login` mengautentikasi CLI ke akun Supabase.
2. `link` menghubungkan folder ini ke project `Dashboard-Mentawai`.
3. `db push --dry-run` menampilkan migration yang akan dijalankan tanpa mengubah database.
4. `db push --include-seed` menjalankan migration, membuat bucket/RLS/Auth trigger, lalu mengisi data dari `seed.sql`.

Gunakan `npx supabase db reset` hanya untuk database lokal yang boleh dihapus. Perintah reset menghapus dan membuat ulang schema, lalu menjalankan migration dan seed. Jangan gunakan `db reset --linked` pada production.

CLI belum terpasang di komputer ini, tetapi tidak dibutuhkan untuk workflow SQL Editor.

## Auth login

The seed intentionally does not insert directly into `auth.users`, because Supabase Auth users should be created through the Dashboard or Auth Admin API. Create an administrator account using a secure, unique credential managed outside this repository, then set its `profiles.role` to `Administrator`. Enable email confirmation according to your deployment policy.

The `on_auth_user_created` trigger will create the matching row in `public.profiles` automatically.

Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code or commit `.env.local`.
