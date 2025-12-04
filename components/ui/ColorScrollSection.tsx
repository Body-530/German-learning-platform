"use client";
import { useEffect, useState } from "react";

export default function ColorScrollSection() {
  const [bgColor, setBgColor] = useState("bg-blue-500");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if(scrollY < 300) setBgColor("bg-blue-500");
      else if(scrollY < 600) setBgColor("bg-green-500");
      else setBgColor("bg-yellow-500");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`h-screen transition-colors duration-700 ${bgColor}`}>
      <h1 className="text-white text-4xl text-center pt-40">Scroll to see color change!</h1>
    </div>
  );
}
