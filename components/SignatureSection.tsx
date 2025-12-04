// ================= Signature ==================

"use client";
import React from "react";
import { motion } from "framer-motion";

const SignatureSection = () => (
  <footer className="py-10 bg-black text-center text-white">
    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}   transition={{ duration: 1 }} className="text-lg opacity-80 tracking-wide"> 
      Made with ❤️ by <span className="font-bold text-yellow-400">Eng. Abdelrahman Yasser</span>
    </motion.p>
    <p className="text-sm opacity-50 mt-2">© 2025 Deutsch Lernen Platform — All Rights Reserved.</p>
  </footer>
);

export default SignatureSection;