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
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    // We log it instead of throwing to prevent breaking the build pipeline if env vars are provided later
  }
}
