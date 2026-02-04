// ================= Contact Us ==================
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

const ContactUsSection = () => (
  <section className="py-20 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-12">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col justify-center space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Got a question?... Need help? We're always here for you! Send us a message anytime and we'll get back to you ASAP.
            </p>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Email</h3>
              <p className="text-gray-700 dark:text-gray-300">abdelrahman.yasser530@gmail.com</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Phone</h3>
              <p className="text-gray-700 dark:text-gray-300">+20 01026547233</p>
            </div>
          </div>
          <form className="bg-white dark:bg-gray-900 p-8 shadow-xl rounded-xl space-y-6 border border-gray-200 dark:border-gray-700">
            <Input type="text" placeholder="Your Name" />
            <Input type="email" placeholder="Your Email" />
            <Textarea placeholder="Your Message" rows={5} />
            <Button className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300">Send Message</Button>
          </form>
        </div>
      </div>
    </motion.div>
  </section>
);

export default ContactUsSection;
