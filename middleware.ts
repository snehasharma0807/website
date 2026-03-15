import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { CookieSerializeOptions } from 'next/dist/server/web/types';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — get/set/remove are deprecated in v0.15 but required for Next.js 12
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name);
        },
        set(name: string, value: string, options: CookieSerializeOptions) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieSerializeOptions) {
          res.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // No session → send to /login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Has session but email not in admins table → /login?error=not_admin
  const email = session.user.email ?? '';
  const { data: adminRow } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'not_admin');
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// Only run middleware on /admin routes
// /auth/callback is excluded so the session can be established before any check
export const config = {
  matcher: ['/admin/:path*'],
};
