// // lib/supabaseClient.ts

// import { createClient } from '@supabase/supabase-js';

// // قراءة المفاتيح من متغيرات البيئة
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// // التحقق من وجود المفاتيح لتجنب الأخطاء الصامتة
// if (!supabaseUrl || !supabaseKey) {
//   throw new Error("Missing Supabase environment variables in .env.local");
// }

// // إنشاء وتصدير العميل ليتم استخدامه في باقي الملفات
// export const supabase = createClient(supabaseUrl, supabaseKey, {
//   auth: {
//     persistSession: true, // مهم جداً: يحفظ الـ session
//     autoRefreshToken: true,
//     detectSessionInUrl: true
//   }
// });
// lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';

// ✅ الطريقة الصحيحة: استخدام SSR Browser Client
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// للتوافق مع الكود القديم
export default supabase;
