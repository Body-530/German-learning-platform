

"use server";

import { supabase } from "@/lib/supabaseClient";
import { redirect } from 'next/navigation';


export async function studentSignUp(prevState: any, formData: FormData) 
 {

  const first_name = formData.get('firstName') as string;
  const last_name = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const german_level = formData.get('level') as string;

  console.log("Starting student signup for:", email);

  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
     
      data: { 
        first_name, 
        last_name, 
        role: 'student',
        german_level: german_level
      }
    }
  });

  if (authError) {
    console.error("Supabase Auth Error:", authError.message);
    return { error: authError.message };
  }

  const userId = authData.user?.id;

  if (userId) {
    console.log("Student registered successfully via Auth Trigger!");
  }
  
  redirect('/login');
}


