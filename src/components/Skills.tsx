import React from "react";
import { motion } from "motion/react";
import { 
  FileCode, 
  Layout, 
  Terminal, 
  Github, 
  Server, 
  Network 
} from "lucide-react";

const skills = [
  { name: "HTML", icon: <FileCode />, level: 95, color: "text-orange-500" },
  { name: "CSS", icon: <Layout />, level: 90, color: "text-blue-500" },
  { name: "JavaScript", icon: <Terminal />, level: 85, color: "text-yellow-500" },
  { name: "Git & GitHub", icon: <Github />, level: 80, color: "text-slate-400" },
  { name: "Basic Node.js", icon: <Server />, level: 70, color: "text-green-500" },
  { name: "Computer Networks", icon: <Network />, level: 75, color: "text-purple-500" },
];

export default function Skills() {
  return (
    <section id="skills" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-[0.3em] text-primary font-bold mb-4">My Expertise</h2>
          <h3 className="text-4xl font-bold">Technical Skills</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl glass hover:neon-border transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800 ${skill.color} group-hover:scale-110 transition-transform`}>
                  {skill.icon}
                </div>
                <h4 className="text-xl font-bold">{skill.name}</h4>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="opacity-60">Proficiency</span>
                  <span className="text-primary">{skill.level}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
