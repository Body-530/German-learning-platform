"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, MoreHorizontal, Calendar } from "lucide-react";
import Link from "next/link";

export default function StudentTableClient({ initialStudents }: { initialStudents: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = initialStudents.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <>
 
      <div className="relative w-full md:w-[300px] mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          placeholder="Search students..."
          className="pl-10 h-10 w-full rounded-md border border-input bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // التحديث فوراً
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Student Name</TableHead>
            <TableHead>Current Level</TableHead>
            <TableHead className="text-center">Exams Taken</TableHead>
            <TableHead className="w-[200px]">Average Performance</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                No students found.
              </TableCell>
            </TableRow>
          ) : (
            filteredStudents.map((student) => (
              <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {student.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {student.german_level || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 font-semibold">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {student.stats.examsTaken}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Average Score</span>
                      <span className={student.stats.statusColor}>
                        {student.stats.averageScore}%
                      </span>
                    </div>
                    <Progress value={student.stats.averageScore} className="h-2" />
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {student.stats.lastActive}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/teacher/student/${student.id}`}>
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}