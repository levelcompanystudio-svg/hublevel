/**
 * Supabase client for HubLevel.
 *
 * Creates a single Supabase client instance using environment variables.
 * No authentication flows are implemented - this is the base client
 * ready to be extended with auth, realtime, etc. in future stages.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY
);
