
// ================= Hero Section ==================
"user client" ;
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section
      className="relative text-white py-32 md:py-48 overflow-hidden bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: "url('/student.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
          Your Future Starts Here.
        </h1>
        <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl font-medium">
          Start your journey to German fluency today with interactive lessons, personalized vocabulary, and AI conversations.
        </p>
        <div className="flex justify-center md:justify-start space-x-4">
          <Link href="/signup">
            <motion.div whileHover={{ scale: 1.3 , rotate: -5 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button className="text-lg px-8 py-6 shadow-xl bg-green-500 hover:bg-green-600 transition-all duration-300">
                Create an Account
              </Button>
            </motion.div>
          </Link>
          <Link href="/login">
            <motion.div whileHover={{ scale: 1.45 , rotate: 5 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button variant="outline" className="text-lg px-8 py-6 shadow-xl bg-white/20 hover:bg-white/30 border-white text-white backdrop-blur-sm transition-all duration-300">
                Sign In
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;