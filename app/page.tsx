
"use client";
import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeatureSection";
import CallToActionSection from "../components/CallToActionSection";
import ContactUsSection from "../components/ContactUsSection";
import SignatureSection from "../components/SignatureSection";
import FeatureCard from "@/components/FeatureCard";


export default function Home() {
  // هذا هو كود الـ URL الخاص بالتضمين، تأكد من تغيير 'VIDEO_ID_HERE'
  const videoEmbedUrl = "/video.mp4";

  return (

    <div className="min-h-screen font-sans">
      
      <HeroSection />
      
      <FeaturesSection />
         {/* --- بداية كود الفيديو المباشر --- */}
      <div className="flex justify-center my-10">
        <iframe
          width="800"
          height="450"
          src={videoEmbedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="My Website Introduction Video"
          className="rounded-lg shadow-xl" // يمكنك استخدام Tailwind CSS لتنسيق أفضل
        ></iframe>
      </div>
      {/* --- نهاية كود الفيديو المباشر --- */}
      <CallToActionSection />
      <ContactUsSection />
      <SignatureSection />
    </div>
  );
}
