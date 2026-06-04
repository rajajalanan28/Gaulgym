/**
 * Validates that all required environment variables are set.
 *
 * H-6/H-14/S-2: Throws an Error when critical env vars are missing so the
 * app fails fast instead of silently running in a broken state.
 *
 * The throw is skipped during the Next.js *build* phase (where env vars may
 * not yet be injected) to avoid breaking CI/CD pipelines.  At runtime — both
 * server-side and client-side — missing vars will crash the process immediately.
 */
export function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  // Only check service role key on the server side
  if (typeof window === 'undefined') {
    required.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;

    // During the Next.js build phase (next build) env vars may not be available
    // yet.  We detect this via the NEXT_PHASE env var that Next.js sets
    // automatically, or by checking for the common CI build indicator.
    const isBuildPhase =
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-export';

    if (isBuildPhase) {
      // Log a warning during build but don't crash the pipeline.
      console.warn(`[build] ${message} — skipping hard check during build phase.`);
      return;
    }

    // At runtime: fail fast so the issue is caught immediately.
    throw new Error(message);
  }
}
