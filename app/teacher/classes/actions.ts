"use server";

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export async function createClass(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const level = formData.get("level") as string;

  // 1. الحصول على هوية المدرس الحالي
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {error: "User not authenticated"};
  }

  // 2. إدخال الفصل الجديد في جدول 'classes'
  // ملاحظة: teacher_id سيأخذ قيمة user.id
  const { error } = await supabase
    .from("classes")
    .insert({
      name: name,
      level: level,
      teacher_id: user.id, 
    });

  if (error) {
    console.error("Create Class Error:", error.message);
    return { error: error.message };
  }

  // 3. تحديث الصفحة لعرض الفصل الجديد فوراً
  revalidatePath("/teacher/classes");
  
  return { message: "Class created successfully!" };
}