// ================= Feature Section ==================

"use client";
import React from "react";
import { Zap, Star, MessageSquare } from "lucide-react";
import FeatureCard from "./FeatureCard"; 

const FeatureSection = () => (
  <section className="py-20 dark:bg-gray-900 bg-gray-50 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-12">Why Deutsch Lernen?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <FeatureCard icon={Zap} title="Interactive Lessons" description="Fun exercises, games, and instant quizzes structured for rapid learning." color="blue" />
        <FeatureCard icon={Star} title="Smart Vocabulary List" description="Save new words (German ↔ Arabic), track your mastery, and use spaced repetition." color="yellow" />
        <FeatureCard icon={MessageSquare} title="AI Conversation Partner" description="Practice real-life dialogue with our Gemini-powered AI, complete with real-time corrections." color="green" />
      </div>
    </div>
  </section>
);

export default FeatureSection;