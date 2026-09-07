import { NextResponse } from 'next/server';
import paths, { rootPaths } from 'routes/paths';
import { createClient } from 'lib/supabase/server';
import { normalizeAuthNextPath } from 'lib/supabase/redirect';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = normalizeAuthNextPath(requestUrl.searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  const loginUrl = new URL(paths.defaultJwtLogin, requestUrl.origin);
  loginUrl.searchParams.set('callbackUrl', next || rootPaths.root);

  return NextResponse.redirect(loginUrl);
}
