import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, MessageSquare } from "lucide-react";

const roles = ["Web Developer", "Problem Solver", "Tech Enthusiast"];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
        if (displayText === currentRole) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentRole.substring(0, displayText.length - 1));
        if (displayText === "") {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, isDeleting ? 50 : 150);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl md:text-2xl font-medium text-primary mb-4">Hi, I'm Rakibul Riyel</h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            Aspiring <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Full-Stack</span> Developer
          </h1>
          
          <div className="h-12 text-2xl md:text-3xl font-mono text-slate-600 dark:text-slate-400">
            {displayText}
            <span className="animate-pulse">|</span>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="#projects"
              className="group relative px-8 py-4 bg-primary text-white rounded-full font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                View Projects <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
            <a
              href="#contact"
              className="px-8 py-4 border-2 border-slate-200 dark:border-slate-800 rounded-full font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              <MessageSquare size={20} /> Contact Me
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest opacity-50">Scroll Down</span>
        <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}
