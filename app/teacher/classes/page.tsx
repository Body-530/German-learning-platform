import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, GraduationCap, UserPlus, Search, User, XCircle } from "lucide-react";
import { deleteStudent } from "./actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ManageStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // جلب الطلاب مع فلترة البحث لو موجود
  let supabaseQuery = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student');

  if (query) {
    supabaseQuery = supabaseQuery.ilike('first_name', `%${query}%`);
  }

  const { data: students } = await supabaseQuery.order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-zinc-950 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Students Center
            </h1>
            <p className="text-zinc-500 mt-1 font-medium italic">German Language Academy Management</p>
          </div>
          <Link href="/register/student">
            <Button className="bg-black hover:bg-zinc-800 text-white rounded-2xl px-6 h-12 shadow-xl transition-all hover:scale-105">
              <UserPlus className="mr-2 h-5 w-5" /> Add New Student
            </Button>
          </Link>
        </div>

        {/* Stats & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-4 rounded-[2rem] border-none shadow-sm flex items-center gap-4 bg-white dark:bg-zinc-900 col-span-1">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <GraduationCap size={24} />
                </div>
                <div>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Students</p>
                    <p className="text-2xl font-black">{students?.length || 0}</p>
                </div>
            </Card>

            <div className="md:col-span-3">
                <form className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <Input 
                        name="q"
                        defaultValue={query}
                        placeholder="Search for a student name..." 
                        className="h-16 pl-12 pr-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 text-lg focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                </form>
            </div>
        </div>

        {/* Custom Table Design */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden border border-zinc-100 dark:border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Student Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">German Level</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">System ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {students && students.length > 0 ? students.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-blue-600">
                            <User size={24} />
                        </div>
                        <div>
                            <span className="block font-bold text-zinc-900 dark:text-zinc-100 text-lg capitalize tracking-tight">
                            {student.first_name} {student.last_name}
                            </span>
                            <span className="text-xs text-zinc-400">Registered Student</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="blue">{student.german_level || 'A0'}</Badge>
                    </td>
                    <td className="px-8 py-6 text-zinc-400 font-mono text-[10px] tracking-tighter">
                      {student.id}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <form action={async () => {
                          "use server";
                          await deleteStudent(student.id);
                      }}>
                        <Button variant="ghost" className="h-12 w-12 rounded-2xl text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-all">
                          <Trash2 size={20} />
                        </Button>
                      </form>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={4} className="py-32 text-center">
                            <div className="flex flex-col items-center opacity-20">
                                <XCircle size={64} strokeWidth={1} />
                                <p className="mt-4 text-xl font-bold">No students found matching "{query}"</p>
                            </div>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون Badge صغير داخلي للجمالية
function Badge({ children, variant }: { children: React.ReactNode, variant: string }) {
    return (
        <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100 dark:border-blue-900/30">
            {children}
        </span>
    )
}
