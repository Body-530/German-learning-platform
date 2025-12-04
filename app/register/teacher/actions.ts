"use server";

import { supabase } from "@/lib/supabaseClient";
import { redirect } from 'next/navigation';

export async function teacherSignUp(prevState: any, formData: FormData) {
  const first_name = formData.get('firstName') as string;
  const last_name = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const qualification = formData.get('qualification') as string;

  console.log("Starting teacher signup for:", email);

  // 1. Sign Up the user using Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name, last_name, role: 'teacher' }
    }
  });

  if (authError) {
    console.error("Supabase Auth Error:", authError.message);
    return { error: authError.message };
  }

  const userId = authData.user?.id;

  if (userId) {
    // 2. Insert the teacher's profile into the 'profiles' table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        role: 'teacher',
        first_name: first_name,
        last_name: last_name,
        qualification: qualification,
      });

    if (profileError) {
      console.error("Profile Insert Error:", profileError.message);
      return { error: profileError.message };
    }
    
    console.log("Teacher registered successfully!");
  }
  
  // 3. Success: Redirect the teacher to the login page (or dashboard later)
  redirect('/login');
 }
// "use server";

// import { supabase } from "@/lib/supabaseClient";
// import { redirect } from 'next/navigation';

// export async function teacherSignUp(prevState: any, formData: FormData) {
//   // 1. استخراج البيانات من النموذج (المفترض هنا أن نموذج المعلم قد لا يتطلب german_level)
//   const first_name = formData.get('firstName') as string;
//   const last_name = formData.get('lastName') as string;
//   const email = formData.get('email') as string;
//   const password = formData.get('password') as string;
  
//   // (قد يكون هناك حقول خاصة بالمعلم مثل 'certification_id' بدلاً من 'german_level')
//   // const certification_id = formData.get('certId') as string;

//   console.log("Starting teacher signup for:", email);

//   // 2. إنشاء حساب المستخدم (Auth) وتمرير البيانات للـ Metadata
//   const { data: authData, error: authError } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       data: { 
//         first_name: first_name, 
//         last_name: last_name, 
//         role: 'teacher', // <--- التغيير الوحيد: تحديد الدور كـ 'teacher'
//         // german_level: null // إذا لم يكن مطلوباً للمعلم، يمكن إرساله كـ null أو حذفه
//       }
//     }
//   });

//   if (authError) {
//     console.error("Supabase Auth Error:", authError.message);
//     return { error: authError.message };
//   }

//   // الـ Trigger سيعمل تلقائياً ويضيف المستخدم كـ 'teacher' في جدول profiles

//   console.log("Teacher registered successfully via Auth Trigger!");
//   redirect('/login');
// }
