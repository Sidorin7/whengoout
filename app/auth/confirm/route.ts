import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // `next` comes from the URL, so it's attacker-controllable — restrict it to the two
  // legitimate destinations instead of passing it straight into a redirect (open-redirect risk).
  // Recovery links set next=/auth/update-password (see Recovery email template in README);
  // signup-confirmation and other links fall back to the home page.
  const rawNext = searchParams.get("next");
  const next = rawNext === "/auth/update-password" ? rawNext : "/";

  // Default Supabase email templates use `{{ .ConfirmationURL }}`, which routes through
  // Supabase's own hosted /auth/v1/verify first; that endpoint redirects back here with
  // `?code=` (PKCE), not `token_hash`/`type`. Exchanging it works as long as the link is
  // opened in the same browser that requested it — the PKCE verifier lives in a cookie set
  // by the browser client (@supabase/ssr), readable here via the server client's cookie jar.
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // A custom email template pointing straight at this route with `token_hash`/`type`
  // (see README) skips Supabase's hosted /verify entirely, so it also works cross-device.
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", origin));
}
