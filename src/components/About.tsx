import React from "react";
import { motion } from "motion/react";
import { Code, Cpu, Globe } from "lucide-react";
import profileImage from "../assets/profile.jpg";

const highlights = [
  {
    icon: <Code className="text-primary" />,
    title: "Web Development",
    description: "Building responsive and dynamic web applications using modern technologies."
  },
  {
    icon: <Cpu className="text-secondary" />,
    title: "Problem Solving",
    description: "Applying algorithmic thinking and logical reasoning to solve complex challenges."
  },
  {
    icon: <Globe className="text-accent" />,
    title: "Networking Basics",
    description: "Understanding the fundamentals of computer networks and cybersecurity."
  }
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 pointer-events-none"></div>
              <div className="relative aspect-square rounded-2xl overflow-hidden glass">
                <img
                  src={profileImage}
                  alt="Rakibul Riyel"
                  className="w-full h-full object-cover grayscale-0 hover:grayscale transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <h2 className="text-sm uppercase tracking-[0.3em] text-primary font-bold mb-4">About Me</h2>
            <h3 className="text-4xl font-bold mb-6">CSE Student & Passionate Developer</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              I am a Computer Science and Engineering student passionate about web development, 
              software engineering, and problem solving. I have experience working with HTML, CSS, 
              JavaScript, and I am currently learning modern frameworks and backend development. 
              I also have academic knowledge in computer networks and cybersecurity.
            </p>

            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
              {highlights.map((item, index) => (
                <div key={index} className="p-6 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 hover:neon-border transition-all">
                  <div className="mb-4">{item.icon}</div>
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
