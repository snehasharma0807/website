import { createServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CookieSerializeOptions } from 'next/dist/server/web/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string | undefined;

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies[name];
          },
          set(name: string, value: string, options: CookieSerializeOptions) {
            res.setHeader('Set-Cookie', serializeCookie(name, value, options));
          },
          remove(name: string, options: CookieSerializeOptions) {
            res.setHeader('Set-Cookie', serializeCookie(name, '', { ...options, maxAge: 0 }));
          },
        },
      },
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  // After exchange, send the user to the admin dashboard
  res.redirect('/admin');
}

function serializeCookie(name: string, value: string, options: CookieSerializeOptions): string {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.domain) cookie += `; Domain=${options.domain}`;
  if (options.secure) cookie += '; Secure';
  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  return cookie;
}
