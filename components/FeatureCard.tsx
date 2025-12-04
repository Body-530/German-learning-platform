
// ================= Feature Card ==================
"use client";
import React from "react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  color?: "blue" | "yellow" | "green";
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className={`group p-8 rounded-xl shadow-xl transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl relative overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700`}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${color === "blue" ? "bg-blue-500" : color === "yellow" ? "bg-yellow-500" : "bg-green-500"}`}></div>
    <Icon className={`w-16 h-16 mx-auto mb-6 relative z-10 ${color === "blue" ? "text-blue-500" : color === "yellow" ? "text-yellow-500" : "text-green-500"}`} />
    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 relative z-10">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 relative z-10">{description}</p>
  </motion.div>
);

export default FeatureCard;