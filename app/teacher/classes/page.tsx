import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowRight, FolderKanban } from "lucide-react";
import Link from "next/link";

export default async function ManageClassesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // جلب الفصول الخاصة بالمدرس الحالي مع عد الطلاب
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      *,
      class_students(count)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header بتصميم عريض */}
        <div className="flex justify-between items-center mb-12 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Classroom Hub
            </h1>
            <p className="text-gray-500 mt-2">Organize your students into efficient learning groups.</p>
          </div>
          {/* هنا ممكن تفتح Modal لإضافة فصل جديد */}
          <Button className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-2xl text-lg font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105">
            <Plus className="mr-2 h-6 w-6" /> Create New Class
          </Button>
        </div>

        {/* عرض الفصول */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {classes && classes.length > 0 ? (
            classes.map((cls) => (
              <Link href={`/teacher/classes/${cls.id}`} key={cls.id} className="group">
                <Card className="border-none shadow-md hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-900">
                  <CardHeader className="p-10 pb-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FolderKanban size={32} />
                      </div>
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-700 dark:bg-zinc-800 dark:text-blue-400 rounded-full text-sm font-black tracking-widest uppercase">
                        Level {cls.level}
                      </span>
                    </div>
                    <CardTitle className="text-3xl font-black mb-2">{cls.name}</CardTitle>
                    <div className="flex items-center gap-2 text-gray-400 font-medium">
                        <Users size={18} />
                        <span>{cls.class_students[0]?.count || 0} Students enrolled</span>
                    </div>
                  </CardHeader>

                  <CardContent className="px-10 pb-10">
                    <div className="pt-8 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                        <span className="font-bold text-blue-600">Manage Content & Students</span>
                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center border-4 border-dashed rounded-[3rem] border-gray-200 dark:border-zinc-800">
               <h3 className="text-2xl font-bold text-gray-400">No classes created yet.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}