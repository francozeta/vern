import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/db"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies(); // Fixed: Use `cookies` from `next/headers` to get cookie store

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll(); // ya puedes usarlo
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Puedes ignorar esto si usas middleware para sesiones.
          }
        },
      },
    }
  );
}
