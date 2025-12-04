"use server";

import { createClient } from "@/lib/supabaseServer"; // ✅ Server Client
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // ✅ إنشاء Server Client
  const supabase = await createClient();

  // 1. تسجيل الدخول باستخدام Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    return { error: error.message };
  }

  // 2. التحقق من دور المستخدم (Role)
  if (data.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found for user:", data.user.id);
      return { error: "Profile not found. Please contact support." };
    }

    console.log("✅ Login successful! Role:", profile.role);

    // 3. التوجيه بناءً على الدور
    if (profile.role === 'student') {
      redirect('/student/dashboard');
    } else if (profile.role === 'teacher') {
      redirect('/teacher/dashboard');
    }
  }
  
  return { error: "Unknown user role." };
}

// "use server";
// import { supabase } from "@/lib/supabaseClient";
// import { redirect } from 'next/navigation';

// export async function login(prevState: any, formData: FormData) {
//   const email = formData.get('email') as string;
//   const password = formData.get('password') as string;

//   // 1. تسجيل الدخول باستخدام Supabase Auth
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) {
//     return { error: error.message };
//   }

//   // 2. التحقق من دور المستخدم (Role) لتوجيهه بشكل صحيح
//   if (data.user) {
//     const { data: profile, error: profileError } = await supabase
//       .from('profiles')
//       .select('role')
//       .eq('id', data.user.id)
//       .single();

//     if (profileError || !profile) {
//       // إذا لم نجد ملف شخصي، نوجهه للصفحة الرئيسية أو نظهر خطأ
//       console.error("Profile not found for user");
//       return { error: "Profile not found. Please contact support." };
//     }

//     // 3. التوجيه بناءً على الدور
//     if (profile.role === 'student') {
//       redirect('/student/dashboard');
//     } else if (profile.role === 'teacher') {
//       redirect('/teacher/dashboard');
//     }
//   }
  
//   // في حالة غريبة لم يتم فيها التوجيه
//   return { error: "Unknown user role." };
// }

