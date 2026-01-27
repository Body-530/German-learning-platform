"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createClass(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const level = formData.get("level") as string;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication failed. Please login again.", type: "AUTH_ERROR" };
  }

  const { error } = await supabase
    .from("classes")
    .insert({
      name,
      level,
      teacher_id: user.id, 
    });

  if (error) {
    console.error("Database Error:", error.message);
    return { error: "Failed to create class. Please try again.", type: "DB_ERROR" };
  }

  revalidatePath("/teacher/classes");
  return { message: "Class created successfully!", success: true };
}