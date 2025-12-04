// import { cookies } from "next/headers";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

// export const supabaseServer = () => {
//   return createServerComponentClient(
//     { cookies },
//     {
//       supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     }
//   );
// };
// lib/supabaseServer.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // يحدث في Server Components
          }
        },
      },
    }
  );
}

