import React from "react";
import { motion } from "motion/react";
import { Download, FileText } from "lucide-react";
import resumePdf from "../assets/Rakibul_Hasan_Riyel.pdf";

export default function Resume() {
  return (
    <section id="resume" className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-sm uppercase tracking-[0.3em] text-primary font-bold mb-4">Resume</h2>
          <h3 className="text-4xl font-bold mb-8">Download My Resume</h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
            Get a detailed overview of my skills, experience, and qualifications.
            Download my resume to learn more about my background in computer science and development.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <a
              href={resumePdf}
              download="Rakibul_Hasan_Riyel_Resume.pdf"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FileText size={24} />
              Download Resume
              <Download size={20} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}