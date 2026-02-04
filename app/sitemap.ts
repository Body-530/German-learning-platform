

import { MetadataRoute } from 'next'

const BASE_URL = 'http://localhost:3000' 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // 1. المسارات العامة (Public Routes)
  const publicRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // 2. مسارات الطالب (Student Section)
  const studentRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/student/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'always', // تتحدث باستمرار مع الدرجات
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/student/vocab`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/student/quiz`,
      lastModified: new Date(),
      changeFrequency: 'never', // صفحة الامتحان نفسها لا تتغير برمجياً
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/student/exams`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // 3. مسارات المعلم (Teacher Section)
  const teacherRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/teacher/Analytics`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/teacher/classes`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/teacher/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'never', 
      priority: 0.6,
    },
    {
      url:`${BASE_URL}/teacher/student`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority:0.5,
    },
    // أضف أي مسارات أخرى للمعلم هنا مثل /teacher/manage-words
  ]

  // دمج كل المسارات في قائمة واحدة
  return [
    ...publicRoutes,
    ...studentRoutes,
    ...teacherRoutes,
  ]
}