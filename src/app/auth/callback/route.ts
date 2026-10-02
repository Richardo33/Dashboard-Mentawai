import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function hasLegacyAvatar(value: unknown) {
  return typeof value === "string" && value.startsWith("data:");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectUrl = new URL("/dashboard", request.url);
  if (!code) return NextResponse.redirect(new URL("/", request.url));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.redirect(new URL("/", request.url));

  const cookieStore = await cookies();
  const response = NextResponse.redirect(redirectUrl);
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/?error=oauth_callback", request.url));

  const metadata = data.user.user_metadata ?? {};
  if (hasLegacyAvatar(metadata.avatar) || hasLegacyAvatar(metadata.avatar_url)) {
    await supabase.auth.updateUser({ data: { avatar: null, avatar_url: null } });
  }

  return response;
}
