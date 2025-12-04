// ================= Call To Action ==================
"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const CallToActionSection = () => (
  <section className="py-20 bg-blue-700 dark:bg-blue-900 text-white text-center transition-colors duration-300">
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to achieve fluency?</h2>
      <p className="text-xl md:text-2xl mb-8 opacity-90">Join thousands of learners and start your German language journey today!</p>
      <Link href="/signup">
          <motion.div whileHover={{ scale: 1.3 , rotate: -5 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            
          <Button className="bg-yellow-400 text-blue-900 px-10 py-5 rounded-full text-xl font-bold hover:bg-yellow-300 transition-all duration-300 shadow-xl flex items-center justify-center mx-auto">
            Start Learning Now
            <ChevronRight className="w-6 h-6 ml-2" />
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  </section>
);

export default CallToActionSection;