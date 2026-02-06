"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";


async function getSupabaseAdmin() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
export async function deleteStudent(studentId: string) {
  const supabase = await getSupabaseAdmin();
  

  const { error } = await supabase.auth.admin.deleteUser(studentId);

  if (error) {

    await supabase.from("profiles").delete().eq("id", studentId);
  }

  revalidatePath("/teacher/classes");
  return { success: true };
}
