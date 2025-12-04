import { MetadataRoute } from 'next'

// يجب استبدال هذا برابط نطاقك الفعلي عند النشر (مثلاً: https://german-platform.com)
const BASE_URL = 'http://localhost:3000' 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. المسارات الثابتة (Static Routes)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily', // كم مرة تتوقع تحديث هذه الصفحة
      priority: 1.0,           // أهمية الصفحة (1.0 هو الأهم)
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5, // صفحات الدخول/التسجيل أقل أهمية لمحركات البحث
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // يمكن إضافة مسارات أخرى هنا (مثل /about، /contact)
  ]

  // 2. المسارات الديناميكية (Dynamic Routes) - **إذا كانت موجودة**
  // إذا كان لديك صفحات مثل "صفحة لكل طالب" أو "صفحة لكل معلم"
  
  // مثال: إذا كان لديك صفحات مسجلة (registered) للطلاب والمعلمين يجب إظهارها:
  /*
  const students = await fetch('YOUR_API_ENDPOINT_FOR_STUDENTS').then(res => res.json())
  
  const studentRoutes: MetadataRoute.Sitemap = students.map((student: any) => ({
    url: `${BASE_URL}/register/student/${student.id}`,
    lastModified: new Date(student.updatedAt),
    changeFrequency: 'monthly', 
    priority: 0.8,
  }))
  */

  // في حالتك الحالية، نفترض أنك تعتمد على المسارات الثابتة فقط
  const dynamicRoutes: MetadataRoute.Sitemap = [] 

  // دمج جميع المسارات
  return [...staticRoutes, ...dynamicRoutes]
}