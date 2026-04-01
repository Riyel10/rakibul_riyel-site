import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { Github, Star, ExternalLink, Code2 } from "lucide-react";
import { Project } from "../types";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("https://api.github.com/users/Riyel10/repos?sort=updated&per_page=6");
        setProjects(response.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects from GitHub.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-primary font-bold mb-4">Portfolio</h2>
            <h3 className="text-4xl font-bold">Featured Projects</h3>
          </div>
          <a
            href="https://github.com/Riyel10"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary font-bold hover:underline"
          >
            View all on GitHub <ExternalLink size={18} />
          </a>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:neon-border transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Code2 size={24} />
                  </div>
                  <div className="flex items-center gap-1 text-sm opacity-60">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    {project.stargazers_count}
                  </div>
                </div>

                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {project.name.replace(/-/g, " ")}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-3 flex-grow">
                  {project.description || "No description provided for this repository."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                    {project.language || "Misc"}
                  </span>
                  <a
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors"
                  >
                    <Github size={18} /> Source
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
