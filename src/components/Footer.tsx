import React from "react";
import { Github, Linkedin, Twitter, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <a href="#home" className="text-2xl font-bold tracking-tighter text-primary neon-text">
              Riyel<span className="text-secondary">.dev</span>
            </a>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Building digital experiences with passion and precision.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Riyel10"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:text-primary transition-all"
            >
              <Github size={20} />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:text-primary transition-all"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:text-primary transition-all"
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>© 2026 Rakibul Riyel. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
